from flask import Flask, jsonify, redirect, session, request
from flask_cors import CORS
from google_auth import get_flow, get_user_info
from auth_utils import generate_jwt, decode_jwt, save_remember_me_data
from dotenv import load_dotenv
import os
import jwt
import requests

# Загрузка переменных окружения из .env файла
load_dotenv()

# Инициализация Flask приложения
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Настройка секретных ключей
app.secret_key = os.getenv('FLASK_SECRET_KEY')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET_KEY')  # Секретный ключ для подписи JWT

# Разрешить HTTP для локальной разработки (удалить в продакшене)
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


# Маршрут для начала аутентификации через Google
@app.route('/auth/google')
def login():
    flow = get_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state  # Сохраняем состояние в сессии
    print(f"State saved: {state}")  # Для отладки
    return redirect(authorization_url)  # Перенаправляем пользователя на страницу авторизации Google


# Маршрут для обработки callback от Google OAuth2
@app.route('/auth/google/callback')
def callback():
    state = session.get('state')
    if not state:
        return jsonify({"error": "State not found in session"}), 400

    flow = get_flow()
    flow.fetch_token(authorization_response=request.url)

    # Получаем данные пользователя
    credentials = flow.credentials
    user_info = get_user_info(credentials)

    if not user_info:
        return jsonify({"error": "Failed to fetch user info from Google"}), 400

    # Сохраняем данные пользователя в JSON
    save_remember_me_data(user_info['email'], True)  # Используем email как username

    # Генерируем JWT
    token = generate_jwt(user_info)

    # Возвращаем токен и данные пользователя в JSON
    return jsonify({
        "token": token,
        "user_info": user_info,  # Возвращаем данные пользователя
        "redirect_url": "http://localhost:3000/main",
        "message": "Google login successful"
    }), 200


# Маршрут для получения информации о пользователе
@app.route('/auth/user')
def get_user():
    """
    Проверяет JWT и возвращает информацию о пользователе.
    """
    token = request.args.get('token')
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        # Декодируем JWT
        user_data = decode_jwt(token)
        return jsonify(user_data)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401


# Запуск приложения
if __name__ == '__main__':
    app.run(debug=True)