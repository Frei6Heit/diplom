import json
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
from argon2 import PasswordHasher

# Загрузка переменных окружения
load_dotenv()

# Секретный ключ для JWT
JWT_SECRET = os.getenv('JWT_SECRET')

if not JWT_SECRET:
    raise ValueError("JWT_SECRET is not set in .env file")

# Инициализация PasswordHasher
ph = PasswordHasher()

def generate_jwt(user_info):
    """
    Генерирует JWT на основе данных пользователя.
    """
    if not isinstance(JWT_SECRET, str):
        raise TypeError("JWT_SECRET must be a string")

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

def hash_password(password):
    """
    Хеширует пароль с использованием argon2.
    """
    return ph.hash(password)

def check_password(input_password, hashed_password):
    """
    Проверяет, совпадает ли введенный пароль с хешированным.
    """
    try:
        return ph.verify(hashed_password, input_password)
    except Exception as e:
        print(f"Password verification failed: {e}")
        return False

def save_remember_me_data(username, remember_me, password):
    """
    Сохраняет данные "Remember Me" в JSON-файл.
    """
    print(f"Saving user data: username={username}, remember_me={remember_me}, password={password}")  # Отладочный вывод
    data = {
        "username": username,
        "remember_me": remember_me,
        "password": password,
        "timestamp": datetime.now().isoformat()  # Добавляем метку времени
    }

    # Путь к файлу
    file_path = "./data/users.json"

    # Убедимся, что директория существует
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

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
    existing_data = [d for d in existing_data if d["username"] != username]
    
    # Добавление новых данных
    existing_data.append(data)

    # Запись обновленных данных в файл
    with open(file_path, "w") as file:
        json.dump(existing_data, file, indent=4)