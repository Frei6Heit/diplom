from datetime import datetime, timedelta
import jwt
from argon2 import PasswordHasher
import os

ph = PasswordHasher()

def generate_jwt(payload):
    payload.update({
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    })
    return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')

def decode_jwt(token):
    return jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])

def hash_password(password):
    return ph.hash(password)

def check_password(password, hashed):
    try:
        return ph.verify(hashed, password)
    except:
        return False