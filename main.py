"""
Civic AI Shield - FastAPI Backend

This single-file app implements:
- Deepfake detection APIs (image, video, audio) with simulated AI scores
- Claim verification chatbot using an Anthropic Claude placeholder
- Misinformation shield text simplification using an LLM placeholder
- Authentication with JWT + bcrypt password hashing
- PostgreSQL (Supabase) persistence using SQLAlchemy
- Basic security middlewares and validation

All secrets and configuration are read from a `.env` file.
See detailed run instructions at the bottom of this file.
"""

from datetime import datetime, timedelta, timezone
import os
import random
import requests
import uuid
from typing import Dict, Generator, List, Optional

from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    func,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from starlette.responses import JSONResponse
import uvicorn


# ============================================================
# Configuration & Environment
# ============================================================


class Settings(BaseModel):
    """Application settings loaded from environment variables / .env."""

    PROJECT_NAME: str = "Civic AI Shield"

    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ANTHROPIC_API_KEY: Optional[str] = None
    CORS_ALLOW_ORIGINS: str = "*"
    GEMINI_API_KEY: Optional[str] = None
    MAX_UPLOAD_SIZE_MB: int = 20


# Load environment variables from `.env` (same folder as this file)
DOTENV_PATH = os.path.join(os.path.dirname(__file__), ".env")


def load_env_file(path: str) -> None:
    """Simple .env loader (key=value per line)."""
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        # Fail silently; app will fall back to defaults or raise later.
        pass


load_env_file(DOTENV_PATH)

settings = Settings(
    DATABASE_URL=os.environ.get("DATABASE_URL", ""),
    JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", ""),
    JWT_ALGORITHM=os.environ.get("JWT_ALGORITHM", "HS256"),
    ACCESS_TOKEN_EXPIRE_MINUTES=int(
        os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    ),
    ANTHROPIC_API_KEY=os.environ.get("ANTHROPIC_API_KEY"),
    GEMINI_API_KEY=os.environ.get("GEMINI_API_KEY"),
    CORS_ALLOW_ORIGINS=os.environ.get("CORS_ALLOW_ORIGINS", "*"),
    MAX_UPLOAD_SIZE_MB=int(os.environ.get("MAX_UPLOAD_SIZE_MB", "20")),
)

if not settings.DATABASE_URL:
    # Fallback to a local SQLite DB so the app can still run
    settings.DATABASE_URL = "sqlite:///./civic_ai_shield.db"

if not settings.JWT_SECRET_KEY:
    # Fallback insecure key for local dev only
    settings.JWT_SECRET_KEY = "dev-insecure-jwt-key-change-me"


# ============================================================
# Database Setup (SQLAlchemy with Supabase Postgres)
# ============================================================


if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL)
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create tables on startup, but handle connection errors gracefully
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  Warning: Could not create database tables on startup: {e}")
    print("   The app will continue running, but database persistence may not work.")
    print("   Please verify your DATABASE_URL in the .env file.")


# ============================================================
# Database Models
# ============================================================


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploaded_files = relationship("UploadedFile", back_populates="owner")
    verification_history = relationship("VerificationHistory", back_populates="user")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)  # image / video / audio
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    is_deepfake = Column(Integer, nullable=True)  # 0/1 for false/true
    confidence = Column(Float, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="uploaded_files")


class VerificationHistory(Base):
    __tablename__ = "verification_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    claim = Column(Text, nullable=False)
    verdict = Column(String(50), nullable=False)  # True / False / Misleading
    explanation = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)  # JSON-encoded list of sources
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="verification_history")


# ============================================================
# Security: Password Hashing & JWT
# ============================================================


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/auth/login", auto_error=False
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: Optional[int] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Optional version of current user:
    - If no token is provided, returns None (anonymous user).
    - If a token is provided but invalid, raises 401.
    """
    if not token:
        return None
    return get_current_user(token=token, db=db)


# ============================================================
# Pydantic Schemas (Request & Response Models)
# ============================================================


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DeepfakeDetectionResult(BaseModel):
    is_deepfake: bool
    confidence: float
    details: str


class AsyncJobStatus(BaseModel):
    job_id: str
    status: str
    result: Optional[DeepfakeDetectionResult] = None


class ClaimVerificationRequest(BaseModel):
    query: str = Field(..., description="User claim or question to verify")


class ClaimVerificationResponse(BaseModel):
    claim: str
    verdict: str  # True / False / Misleading
    explanation: str
    sources: List[str]


class SimplifyRequest(BaseModel):
    text: str


class SimplifyResponse(BaseModel):
    original: str
    simplified: str


# In-memory store for async detection jobs (demo-only; replace with Redis/DB in production)
ASYNC_DETECTION_JOBS: Dict[str, AsyncJobStatus] = {}


# ============================================================
# External AI Integrations (Placeholder Implementations)
# ============================================================


def simulate_deepfake_detection(file_bytes: bytes, file_type: str) -> DeepfakeDetectionResult:
    """
    Simulate a deepfake detection model.
    In production, replace this with a real ML pipeline. A typical integration
    for PyTorch-based video/image deepfake detection would look like:

    1) Decode the incoming bytes into frames (for video) or an image tensor.
    2) Use MTCNN (or similar) to detect and crop faces from each frame.
    3) Preprocess the cropped faces (resize, normalize) into a batch tensor.
    4) Run the XceptionNet (or other) model in eval mode under torch.no_grad().
    5) Aggregate per-frame / per-face logits into a single probability score.
    6) Return DeepfakeDetectionResult(is_deepfake, confidence, human_readable_details).

    The heavy, blocking part of this pipeline should run either:
    - In a separate worker (Celery/RQ) orchestrated by a job queue, or
    - Inside a FastAPI BackgroundTask (see process_video_detection_job) if you
      can tolerate in-memory job state and at-least-once semantics.
    """
    # Simple random-based simulation
    confidence = round(random.uniform(0.4, 0.99), 4)
    threshold = 0.7
    is_deepfake = confidence >= threshold

    details = (
        f"Simulated {file_type} analysis. Confidence={confidence}. "
        f"Threshold={threshold}."
    )
    return DeepfakeDetectionResult(
        is_deepfake=is_deepfake, confidence=confidence, details=details
    )


def call_llm_for_verification(query: str) -> ClaimVerificationResponse:
    """
    Use Google Gemini API to verify claims about government schemes, benefits, and viral messages.
    Provides structured fact-checking with verdicts: True, False, or Misleading.
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured. Please add GEMINI_API_KEY to .env"
        )
    
    try:
        # Use Gemini 2.5 Flash with v1beta endpoint (available and free)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        
        prompt = f"""You are a fact-checking expert for government schemes and public claims in India. 
Analyze the following claim and provide a verdict.

Claim: {query}

Respond in this EXACT format:
VERDICT: [True OR False OR Misleading]

EXPLANATION: [Provide 2-3 sentences explaining your verdict with factual details about this scheme/claim]

SOURCES: [List any official government sources, ministry websites, or credible sources if applicable]

Be accurate, factual, and cite official information when possible."""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        headers = {"Content-Type": "application/json"}
        
        resp = requests.post(url, json=payload, headers=headers, timeout=20)
        
        # Debug logging
        print(f"[VERIFY-CLAIM] API Status: {resp.status_code}")
        print(f"[VERIFY-CLAIM] Response: {resp.text[:500]}")
        
        if not resp.ok:
            error_msg = resp.text
            print(f"Gemini API Error ({resp.status_code}): {error_msg}")
            raise Exception(f"Gemini API failed: {resp.status_code} - {error_msg[:200]}")
        
        data = resp.json()
        response_text = ""
        
        if "candidates" in data and len(data["candidates"]) > 0:
            parts = data["candidates"][0].get("content", {}).get("parts", [])
            if parts:
                response_text = parts[0].get("text", "")
        
        if not response_text:
            raise Exception("Empty response from Gemini API")
        
        # Parse the structured response
        lines = response_text.split('\n')
        verdict = "False"
        explanation = ""
        sources = []
        
        current_section = None
        for line in lines:
            line = line.strip()
            if line.startswith("VERDICT:"):
                verdict_text = line.replace("VERDICT:", "").strip().upper()
                if "TRUE" in verdict_text:
                    verdict = "True"
                elif "MISLEADING" in verdict_text:
                    verdict = "Misleading"
                else:
                    verdict = "False"
            elif line.startswith("EXPLANATION:"):
                current_section = "explanation"
                explanation = line.replace("EXPLANATION:", "").strip()
            elif line.startswith("SOURCES:"):
                current_section = "sources"
                source_text = line.replace("SOURCES:", "").strip()
                if source_text and source_text.lower() != "n/a":
                    sources.append(source_text)
            elif current_section == "explanation" and line and not line.startswith(("VERDICT:", "EXPLANATION:", "SOURCES:")):
                explanation += " " + line
            elif current_section == "sources" and line and not line.startswith(("VERDICT:", "EXPLANATION:", "SOURCES:")):
                if line and line.lower() != "n/a":
                    sources.append(line)
        
        explanation = explanation.strip()
        if not explanation:
            explanation = response_text
        
        return ClaimVerificationResponse(
            claim=query,
            verdict=verdict,
            explanation=explanation,
            sources=sources
        )
        
    except Exception as e:
        print(f"Claim verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify claim: {str(e)}"
        )


def simplify_text_with_ai(text: str) -> str:
    """
    Use Google Gemini API to simplify complex text, rumors, or viral messages
    into easy-to-understand explanations suitable for all education levels.
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured. Please add GEMINI_API_KEY to .env"
        )
    
    try:
        # Use Gemini 2.5 Flash with v1beta endpoint (available and free)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        
        prompt = f"""You are an expert at explaining complex government schemes, rumors, and viral messages in simple, easy-to-understand language.

Take this text and explain it in a simple, clear way:
{text}

Requirements:
- Write 2-4 sentences that are easy to understand
- Use simple words that anyone can understand
- Avoid jargon and complex terms
- If it's a government scheme, mention the basic facts
- Keep the explanation short and direct
- Do NOT use headings, bullet points, or markdown formatting
- Just write plain text sentences

Explanation:"""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        headers = {"Content-Type": "application/json"}
        
        resp = requests.post(url, json=payload, headers=headers, timeout=20)
        
        # Debug logging
        print(f"[SIMPLIFY] API Status: {resp.status_code}")
        print(f"[SIMPLIFY] Response: {resp.text[:500]}")
        
        if not resp.ok:
            error_msg = resp.text
            print(f"Gemini API Error ({resp.status_code}): {error_msg}")
            raise Exception(f"Gemini API failed: {resp.status_code} - {error_msg[:200]}")
        
        data = resp.json()
        simplified = ""
        
        if "candidates" in data and len(data["candidates"]) > 0:
            parts = data["candidates"][0].get("content", {}).get("parts", [])
            if parts:
                simplified = parts[0].get("text", "")
        
        if not simplified:
            raise Exception("Empty response from Gemini API")
        
        return simplified
        
    except Exception as e:
        print(f"Text simplification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simplify text: {str(e)}"
        )


def process_video_detection_job(
    job_id: str,
    file_bytes: bytes,
    user_id: Optional[int],
    file_name: str,
    mime_type: Optional[str],
) -> None:
    """
    Background task entrypoint for heavy video deepfake inference.

    This is where you should call your real PyTorch pipeline:
    - Decode video frames from file_bytes
    - Run MTCNN for face extraction
    - Run XceptionNet (or similar) on the extracted faces
    - Aggregate predictions into a single DeepfakeDetectionResult
    """
    db = SessionLocal()
    try:
        # Replace this line with the real PyTorch inference call when ready.
        result = simulate_deepfake_detection(file_bytes, file_type="video")

        if user_id is not None:
            uploaded = UploadedFile(
                user_id=user_id,
                file_name=file_name,
                file_type="video",
                mime_type=mime_type or "application/octet-stream",
                size_bytes=len(file_bytes),
                is_deepfake=1 if result.is_deepfake else 0,
                confidence=result.confidence,
                details=result.details,
            )
            db.add(uploaded)
            db.commit()

        job = ASYNC_DETECTION_JOBS.get(job_id)
        if job:
            job.status = "completed"
            job.result = result
        else:
            ASYNC_DETECTION_JOBS[job_id] = AsyncJobStatus(
                job_id=job_id, status="completed", result=result
            )
    except Exception as exc:  # noqa: BLE001
        job = ASYNC_DETECTION_JOBS.get(job_id)
        if job:
            job.status = "failed"
            job.result = None
        else:
            ASYNC_DETECTION_JOBS[job_id] = AsyncJobStatus(
                job_id=job_id, status="failed", result=None
            )
        print(f"Background video detection job {job_id} failed: {exc}")
    finally:
        db.close()


# ============================================================
# FastAPI Application Initialization
# ============================================================


app = FastAPI(title=settings.PROJECT_NAME)


# CORS configuration
raw_origins = [o.strip() for o in settings.CORS_ALLOW_ORIGINS.split(",") if o.strip()]
allow_origin_regex = None
allow_origins = []
for o in raw_origins:
    # allow any localhost port via regex instead of enumerating ports
    if o.startswith("http://localhost") or o.startswith("https://localhost"):
        allow_origin_regex = r"^https?://localhost(:[0-9]+)?$"
    else:
        allow_origins.append(o)

if not allow_origins and not allow_origin_regex:
    allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Error Handling Middleware
# ============================================================


@app.middleware("http")
async def add_error_handling(request: Request, call_next):
    """
    Wrap all requests with basic error handling and logging.
    Converts unhandled exceptions into JSON responses.
    """
    try:
        response = await call_next(request)
        return response
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "error": str(exc),
            },
        )


# ============================================================
# Authentication Endpoints
# ============================================================


@app.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@app.get("/auth/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


# ============================================================
# Helper: File Validation
# ============================================================


async def validate_upload_file(
    upload_file: UploadFile, allowed_prefix: str, max_size_mb: int
) -> bytes:
    if not upload_file.content_type or not upload_file.content_type.startswith(
        allowed_prefix
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Expected {allowed_prefix}*",
        )

    file_bytes = await upload_file.read() # Async read
    size_limit_bytes = max_size_mb * 1024 * 1024
    if len(file_bytes) > size_limit_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size is {max_size_mb} MB.",
        )
    return file_bytes


# ============================================================
# Deepfake Detection Endpoints
# ============================================================


@app.post(
    "/detect/image",
    response_model=DeepfakeDetectionResult,
    summary="Upload image for deepfake detection",
)
async def detect_image_deepfake(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    file_bytes = await validate_upload_file(
        file, allowed_prefix="image/", max_size_mb=settings.MAX_UPLOAD_SIZE_MB
    )
    result = simulate_deepfake_detection(file_bytes, file_type="image")

    # Persist only if a logged-in user is available; allow anonymous usage.
    if current_user is not None:
        uploaded = UploadedFile(
            user_id=current_user.id,
            file_name=file.filename,
            file_type="image",
            mime_type=file.content_type or "application/octet-stream",
            size_bytes=len(file_bytes),
            is_deepfake=1 if result.is_deepfake else 0,
            confidence=result.confidence,
            details=result.details,
        )
        db.add(uploaded)
        db.commit()

    return result


@app.post(
    "/detect/video",
    response_model=DeepfakeDetectionResult,
    summary="Upload video for deepfake detection",
)
async def detect_video_deepfake(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    file_bytes = await validate_upload_file(
        file, allowed_prefix="video/", max_size_mb=settings.MAX_UPLOAD_SIZE_MB
    )
    result = simulate_deepfake_detection(file_bytes, file_type="video")

    if current_user is not None:
        uploaded = UploadedFile(
            user_id=current_user.id,
            file_name=file.filename,
            file_type="video",
            mime_type=file.content_type or "application/octet-stream",
            size_bytes=len(file_bytes),
            is_deepfake=1 if result.is_deepfake else 0,
            confidence=result.confidence,
            details=result.details,
        )
        db.add(uploaded)
        db.commit()

    return result


@app.post(
    "/detect/video/async",
    response_model=AsyncJobStatus,
    summary="Upload video for deepfake detection (background job)",
)
async def detect_video_deepfake_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Alternative video detection endpoint that offloads heavy ML inference to a
    FastAPI BackgroundTask to avoid request timeouts.

    Typical usage pattern:
    1) POST /detect/video/async with the video file -> returns {job_id, status}.
    2) Poll GET /detect/video/jobs/{job_id} until status == \"completed\" or \"failed\".
    3) When completed, the response includes the DeepfakeDetectionResult.
    """
    file_bytes = await validate_upload_file(
        file, allowed_prefix="video/", max_size_mb=settings.MAX_UPLOAD_SIZE_MB
    )
    job_id = str(uuid.uuid4())

    ASYNC_DETECTION_JOBS[job_id] = AsyncJobStatus(job_id=job_id, status="processing")

    user_id = current_user.id if current_user is not None else None
    background_tasks.add_task(
        process_video_detection_job,
        job_id,
        file_bytes,
        user_id,
        file.filename,
        file.content_type,
    )

    return ASYNC_DETECTION_JOBS[job_id]


@app.get(
    "/detect/video/jobs/{job_id}",
    response_model=AsyncJobStatus,
    summary="Get status/result of an async video deepfake detection job",
)
def get_video_detection_job_status(job_id: str) -> AsyncJobStatus:
    job = ASYNC_DETECTION_JOBS.get(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )
    return job


@app.post(
    "/detect/audio",
    response_model=DeepfakeDetectionResult,
    summary="Upload audio for deepfake detection",
)
async def detect_audio_deepfake(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    file_bytes = await validate_upload_file(
        file, allowed_prefix="audio/", max_size_mb=settings.MAX_UPLOAD_SIZE_MB
    )
    result = simulate_deepfake_detection(file_bytes, file_type="audio")

    if current_user is not None:
        uploaded = UploadedFile(
            user_id=current_user.id,
            file_name=file.filename,
            file_type="audio",
            mime_type=file.content_type or "application/octet-stream",
            size_bytes=len(file_bytes),
            is_deepfake=1 if result.is_deepfake else 0,
            confidence=result.confidence,
            details=result.details,
        )
        db.add(uploaded)
        db.commit()

    return result


# ============================================================
# Claim Verification Chatbot
# ============================================================


@app.post(
    "/verify-claim",
    response_model=ClaimVerificationResponse,
    summary="Verify a claim using Anthropic Claude (simulated)",
)
def verify_claim(
    payload: ClaimVerificationRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    result = call_llm_for_verification(payload.query)

    # Persist history only when a logged-in user is available.
    if current_user is not None:
        history_entry = VerificationHistory(
            user_id=current_user.id,
            claim=result.claim,
            verdict=result.verdict,
            explanation=result.explanation,
            sources="[]",
        )
        db.add(history_entry)
        db.commit()

    return result


# ============================================================
# Misinformation Shield - Text Simplification
# ============================================================


@app.post(
    "/simplify",
    response_model=SimplifyResponse,
    summary="Simplify complex text using Gemini AI",
)
def simplify_text(
    payload: SimplifyRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    simplified = simplify_text_with_ai(payload.text)
    return SimplifyResponse(original=payload.text, simplified=simplified)


# ============================================================
# Health Check & Root
# ============================================================


@app.get("/", summary="Service health check")
def read_root() -> dict:
    return {
        "service": settings.PROJECT_NAME,
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ============================================================
# Run with Uvicorn
# ============================================================


if __name__ == "__main__":
    # For local development only. In production, use a process manager
    # (e.g., gunicorn with uvicorn workers) and proper TLS termination.
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )


# ============================================================
# HOW TO RUN THIS SERVER
# ============================================================
#
# 1) Create and activate a virtual environment (recommended):
#    python -m venv .venv
#    .venv\Scripts\activate       # On Windows
#    source .venv/bin/activate    # On macOS/Linux
#
# 2) Install dependencies:
#    pip install fastapi "uvicorn[standard]" python-dotenv sqlalchemy psycopg2-binary ^
#                "python-jose[cryptography]" "passlib[bcrypt]" "pydantic[email]"
#
# 3) Create a `.env` file in the project root (same folder as main.py)
#    with at least the following variables (example values):
#
#    DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
#    JWT_SECRET_KEY=your-very-secret-jwt-key
#    JWT_ALGORITHM=HS256
#    ACCESS_TOKEN_EXPIRE_MINUTES=60
#    ANTHROPIC_API_KEY=your-anthropic-api-key-or-placeholder
#    CORS_ALLOW_ORIGINS=http://localhost:3000,https://your-frontend.app
#    MAX_UPLOAD_SIZE_MB=20
#
#    For Supabase, you can use the connection string from:
#    Project Settings -> Database -> Connection string (prefer the "URI" option).
#
# 4) Start the development server:
#    python main.py
#
#    Or equivalently:
#    uvicorn main:app --reload --host 0.0.0.0 --port 8000
#
# 5) Test the API:
#    - Open the interactive docs in your browser:
#      http://localhost:8000/docs
#
#    - Register a user:
#      POST http://localhost:8000/auth/register
#      Body (JSON): { "email": "you@example.com", "password": "strongpassword" }
#
#    - Login to get a JWT:
#      POST http://localhost:8000/auth/login
#      Form data: username=email, password=password
#
#    - Use the returned `access_token` as a Bearer token in:
#      - /detect/image, /detect/video, /detect/audio
#      - /verify-claim
#      - /simplify
#
# 6) Production considerations:
#    - Use a proper migration tool (e.g., Alembic) instead of `Base.metadata.create_all`.
#    - Run behind a reverse proxy (e.g., Nginx) and terminate TLS there.
#    - Restrict allowed CORS origins and harden security headers.

