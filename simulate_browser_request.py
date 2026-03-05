import requests

def find_frontend_port(start=3000, end=3010):
    for p in range(start, end+1):
        try:
            r = requests.get(f'http://localhost:{p}', timeout=1)
            return p, r.status_code
        except Exception:
            continue
    return None, None

port, status = find_frontend_port(3000, 3020)
if port:
    print('FRONTEND_OK', port, status)
else:
    print('FRONTEND_NOT_FOUND')

try:
    r = requests.post('http://localhost:8000/simplify', json={'text':'Simulated browser test: simplify this text'}, timeout=10)
    print('BACKEND_POST', r.status_code, r.text)
except Exception as e:
    print('BACKEND_ERROR', e)
