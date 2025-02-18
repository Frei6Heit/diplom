import json
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta

# Загрузка переменных окружения
load_dotenv()

# Секретный ключ для JWT
JWT_SECRET = os.getenv('JWT_SECRET')

def generate_jwt(user_info):
    """
    Генерирует JWT на основе данных пользователя.
    """
    payload = {
        'user_id': user_info['id'],
        'email': user_info['email'],
        'exp': datetime.utcnow() + timedelta(hours=1)  # Токен действителен 1 час
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return token

def decode_jwt(token):
    """
    Декодирует JWT и возвращает данные пользователя.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")

def save_remember_me_data(username, remember_me):
    """
    Сохраняет данные "Remember Me" в JSON-файл.
    """
    data = {
        "username": username,
        "remember_me": remember_me,
        "timestamp": datetime.now().isoformat()  # Добавляем метку времени
    }

    # Путь к файлу
    file_path = "./data/users.json"

    # Чтение существующих данных (если файл существует)
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            try:
                existing_data = json.load(file)
            except json.JSONDecodeError:
                existing_data = []
    else:
        existing_data = []

    # Удаление дубликатов по username
    existing_data = [d for d in existing_data if d["username"]!= username]
    
    # Добавление новых данных
    existing_data.append(data)

    # Запись обновленных данных в файл
    with open(file_path, "w") as file:
        json.dump(existing_data, file, indent=4)