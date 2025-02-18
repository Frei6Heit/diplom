import os
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

class Config:
    FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY')
    JWT_SECRET = os.getenv('JWT_SECRET_KEY')
    OAUTHLIB_INSECURE_TRANSPORT = os.getenv('OAUTHLIB_INSECURE_TRANSPORT', '1')