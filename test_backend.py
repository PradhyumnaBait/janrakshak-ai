from main import app, SessionLocal, User
from fastapi.testclient import TestClient

client = TestClient(app)

print('GET /', client.get('/').status_code, client.get('/').json())

email = 'test@example.com'
password = 'password123'

# cleanup existing user
with SessionLocal() as db:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.delete(existing)
        db.commit()

resp = client.post('/auth/register', json={'email': email, 'password': password})
print('register', resp.status_code, resp.json())

resp = client.post('/auth/login', data={'username': email, 'password': password})
print('login', resp.status_code, resp.json())

if resp.status_code == 200:
    token = resp.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    resp2 = client.post('/simplify', json={'text': 'Complex text'}, headers=headers)
    print('simplify', resp2.status_code, resp2.json())
