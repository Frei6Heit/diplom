from flask import Flask, jsonify, redirect, session, request
from flask_cors import CORS
from google_auth import get_flow, get_user_info
from auth_utils import generate_jwt, decode_jwt, hash_password, check_password
from dotenv import load_dotenv
from datetime import datetime
import os
import jwt
import json
from argon2 import PasswordHasher as ph  # Используем argon2 для хеширования

# Загрузка переменных окружения
load_dotenv()

# Инициализация Flask приложения
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Настройка секретных ключей jwt
app.secret_key = os.getenv('FLASK_SECRET_KEY')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')

# Разрешение использования HTTP для локальной разработки
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Файл с данными о пользователях
USERS_FILE = "./data/users.json"


# Функция загрузки данных пользователей из файла
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return []
    else:
        return []

# Функция сохранения данных пользователей в файл
def save_users(users):
    with open(USERS_FILE, "w") as file:
        json.dump(users, file, indent=4)

# Маршруты FLASK ===================================

@app.route('/auth/user', methods=['GET'])
def get_user():
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        # Убираем "Bearer " из токена
        token = token.split(" ")[1]
        user_data = decode_jwt(token)
        return jsonify(user_data), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401


# Маршрут создания аккаунта
# Маршрут создания аккаунта
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    users = load_users()

    # Проверяем количество пользователей
    if len(users) >= 5:
        return jsonify({"error": "Maximum number of accounts reached (5)"}), 400

    existing_user = next((u for u in users if u["username"] == username), None)

    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    hashed_password = hash_password(password)  # Хешируем пароль
    new_user = {
        "username": username,
        "password": hashed_password,  # Сохраняем хешированный пароль
        "remember_me": False,
        "timestamp": datetime.now().isoformat()
    }
    users.append(new_user)
    save_users(users)

    return jsonify({"message": "Registration successful"}), 201

# Маршрут входа

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "username: Username and password are required"}), 400

    users = load_users()
    user = next((u for u in users if u["username"] == username), None)

    if not user:
        return jsonify({"error": "username: User not found"}), 404

    if not check_password(password, user["password"]):  # Проверяем пароль
        return jsonify({"error": "password: Invalid password"}), 401

    token = generate_jwt({"id": user["username"], "email": user.get("email", "")})
    
    # Возвращаем токен и URL для перенаправления на фронтенд
    return jsonify({
        "token": token,
        "redirect_url": "http://localhost:3000/main"  # Указываем URL фронтенда
    }), 200

# Маршрут авторизации через Google OAuth 2.0
@app.route('/auth/google', methods=['GET'])
def google_auth():
    # flow = get_flow()
    # authorization_url, state = flow.authorization_url(prompt='consent')
    # session['state'] = state
    return redirect('http://localhost:3000/main')

# Маршрут обработки callback от Google OAuth 2.0
@app.route('/auth/google/callback', methods=['GET'])
def google_callback():
    state = session.get('state')
    code = request.args.get('code')

    if not state or state != request.args.get('state'):
        return jsonify({"error": "Invalid state"}), 403

    flow = get_flow()
    try:
        token = flow.fetch_token(code=code)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    user_info = get_user_info(token)
    username = user_info.get('name')
    email = user_info.get('email')

    users = load_users()
    existing_user = next((u for u in users if u["username"] == username), None)

    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    hashed_password = hash_password(username)
    new_user = {
        "username": username,
        "password": hashed_password,
        "remember_me": True,
        "timestamp": datetime.now().isoformat()
    }
    users.append(new_user)
    save_users(users)

    token = generate_jwt({"id": username, "email": email})
    return jsonify({"token": token, "redirect_url": "/main"}), 200

if __name__ == '__main__':
    app.run(debug=True)