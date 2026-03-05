# JanRakshak AI - Civic Shield

A full-stack application for fact-checking government schemes, detecting deepfakes, and simplifying misinformation using Google Gemini AI.

## Features

✅ **Claim Verification** - Fact-check government schemes and public claims with Gemini AI
✅ **Misinformation Shield** - Simplify complex rumors and viral messages  
✅ **Deepfake Detection** - Detect deepfakes in images, videos, and audio
✅ **User Authentication** - Secure JWT-based authentication with bcrypt
✅ **Database Persistence** - SQLite for local development, PostgreSQL for production

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - ORM for database management
- **Google Gemini API** - Real AI-powered responses
- **JWT & bcrypt** - Secure authentication

### Frontend
- **Next.js 14** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Works on mobile, tablet, and desktop

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API Key ([Get it free](https://aistudio.google.com))

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd janrakshak-ai
```

2. **Backend Setup**
```bash
cd janrakshak ai
python -m venv .venv
.venv\Scripts\activate  # On Windows
# source .venv/bin/activate  # On Mac/Linux

pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. **Frontend Setup**
```bash
cd janrakshak-frontend
npm install
```

5. **Run the Application**

Backend (Terminal 1):
```bash
cd janrakshak ai
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend (Terminal 2):
```bash
cd janrakshak-frontend
npm run dev
```

Access the app at `http://localhost:3001`

## API Documentation

Interactive API docs available at: `http://localhost:8000/docs`

### Key Endpoints

- `POST /verify-claim` - Verify government scheme claims
- `POST /simplify` - Simplify complex text
- `POST /detect/image` - Detect deepfakes in images
- `POST /detect/video` - Detect deepfakes in videos
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/janrakshak-ai.git
git branch -M main
git push -u origin main
```

2. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_API_URL` = Your backend URL

3. **Deploy Backend (FastAPI)**
   
   **Option A: Render.com** (Free tier available)
   - Push code to GitHub
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

   **Option B: Railway.app**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect GitHub repository
   - Set environment variables and PORT

### Environment Variables for Production

Create these in your deployment platform's dashboard:

```
DATABASE_URL=postgresql://...  # Your Supabase/PostgreSQL URL
JWT_SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
CORS_ALLOW_ORIGINS=https://your-vercel-domain.vercel.app
```

## Security Checklist

✅ `.env` file is in `.gitignore` (never commit secrets)  
✅ `.env.example` provided for reference  
✅ JWT tokens used for authentication  
✅ Passwords hashed with bcrypt  
✅ CORS configured for specific origins  
✅ SQL injection protected with SQLAlchemy ORM  

## Project Structure

```
janrakshak-ai/
├── main.py                    # FastAPI backend
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore file
├── vercel.json               # Vercel configuration
├── runtime.txt               # Python runtime version
│
└── janrakshak-frontend/      # Next.js frontend
    ├── app/                  # Next.js app directory
    ├── components/           # React components
    ├── package.json          # Node dependencies
    └── public/               # Static assets
```

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License - Feel free to use this project for educational purposes.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for civic participation and fighting misinformation**
