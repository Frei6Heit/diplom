from flask import Blueprint, request, jsonify, session, redirect
from flasgger import swag_from
from datetime import datetime
import json
import jwt
import os
from utils.auth_utils import generate_jwt, decode_jwt, hash_password, check_password
from utils.google_auth import get_flow, get_user_info

auth_bp = Blueprint('auth', __name__)
USERS_FILE = "./data/users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

@auth_bp.route('/user', methods=['GET'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Получение данных пользователя по JWT',
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Bearer token'
        }
    ],
    'responses': {
        200: {'description': 'Данные пользователя'},
        401: {'description': 'Невалидный токен'}
    }
})
def get_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        token = token.split(" ")[1]
        user_data = decode_jwt(token)
        return jsonify(user_data), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

@auth_bp.route('/register', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Регистрация нового пользователя',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {'type': 'string'},
                    'password': {'type': 'string'}
                },
                'required': ['username', 'password']
            }
        }
    ],
    'responses': {
        201: {'description': 'Успешная регистрация'},
        400: {'description': 'Неверные данные'},
        409: {'description': 'Пользователь уже существует'}
    }
})
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    users = load_users()
    if len(users) >= 5:
        return jsonify({"error": "Maximum number of accounts reached (5)"}), 400

    if any(u["username"] == username for u in users):
        return jsonify({"error": "User already exists"}), 409

    users.append({
        "username": username,
        "password": hash_password(password),
        "remember_me": False,
        "timestamp": datetime.now().isoformat()
    })
    save_users(users)

    return jsonify({"message": "Registration successful"}), 201

@auth_bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Аутентификация пользователя',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'username': {'type': 'string'},
                    'password': {'type': 'string'}
                },
                'required': ['username', 'password']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Успешный вход',
            'schema': {
                'type': 'object',
                'properties': {
                    'token': {'type': 'string'},
                    'redirect_url': {'type': 'string'}
                }
            }
        },
        400: {'description': 'Неверные данные'},
        401: {'description': 'Неверные учетные данные'}
    }
})
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    users = load_users()
    user = next((u for u in users if u["username"] == username), None)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password(password, user["password"]):
        return jsonify({"error": "Invalid password"}), 401

    token = generate_jwt({"id": user["username"], "email": user.get("email", "")})
    return jsonify({
        "token": token,
        "redirect_url": "http://localhost:3000/main"
    }), 200

@auth_bp.route('/google', methods=['GET'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Перенаправление на Google OAuth',
    'responses': {
        302: {'description': 'Перенаправление на страницу аутентификации Google'}
    }
})
def google_auth():
    return redirect('http://localhost:3000/main')

@auth_bp.route('/google/callback', methods=['GET'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Обработка callback от Google OAuth',
    'parameters': [
        {
            'name': 'code',
            'in': 'query',
            'type': 'string',
            'required': True
        },
        {
            'name': 'state',
            'in': 'query',
            'type': 'string',
            'required': True
        }
    ],
    'responses': {
        200: {
            'description': 'Успешная аутентификация',
            'schema': {
                'type': 'object',
                'properties': {
                    'token': {'type': 'string'},
                    'redirect_url': {'type': 'string'}
                }
            }
        },
        403: {'description': 'Неверный state параметр'},
        500: {'description': 'Ошибка сервера'}
    }
})
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
    if any(u["username"] == username for u in users):
        return jsonify({"error": "User already exists"}), 409

    users.append({
        "username": username,
        "password": hash_password(username),
        "remember_me": True,
        "timestamp": datetime.now().isoformat()
    })
    save_users(users)

    token = generate_jwt({"id": username, "email": email})
    return jsonify({"token": token, "redirect_url": "/main"}), 200


@auth_bp.route('/current_user', methods=['GET'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Получение данных текущего пользователя',
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Bearer token'
        }
    ],
    'responses': {
        200: {
            'description': 'Данные пользователя',
            'schema': {
                'type': 'object',
                'properties': {
                    'current_user': {'type': 'string'},
                    'all_users': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    }
                }
            }
        },
        401: {'description': 'Невалидный токен'}
    }
})
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        token = token.split(" ")[1]
        user_data = decode_jwt(token)
        
        # Получаем всех пользователей из файла
        users = load_users()
        usernames = [user["username"] for user in users]
        
        return jsonify({
            "current_user": user_data["id"],
            "all_users": usernames
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
@auth_bp.route('/get_user_token', methods=['POST'])
def get_user_token():
    # Проверяем текущего пользователя
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token is missing"}), 401
    
    try:
        token = token.split(" ")[1]
        current_user_data = decode_jwt(token)
        
        # Получаем запрошенного пользователя
        data = request.get_json()
        requested_username = data.get('username')
        
        # Проверяем, что пользователь существует
        users = load_users()
        user = next((u for u in users if u["username"] == requested_username), None)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Генерируем новый токен для запрошенного пользователя
        new_token = generate_jwt({"id": user["username"], "email": user.get("email", "")})
        
        return jsonify({"token": new_token}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500