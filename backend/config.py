# config.py
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'fallback_secret_key')  # Берем из .env или используем fallback
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION = timedelta(hours=24)