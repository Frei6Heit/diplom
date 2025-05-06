from flask import Blueprint, request, jsonify, Response
import jwt
from functools import wraps
import logging
from datetime import datetime
import time
import json
import os
import subprocess
from .assistant_manager import AssistantManager
from .chat_logic import process_user_query
from .chat_utils import parse_command, execute_command

# Создаем blueprint с уникальным именем
assistant_bp = Blueprint('assistant_api', __name__, url_prefix='/api/assistant')
manager = AssistantManager()

# Настройки токенов
SECRET_KEY = "2cf07d92ee8936c4b93ff3bc52feeff891318a41f91ba8562d06212a3d1f1a42"
JWT_ALGORITHM = "HS256"

logger = logging.getLogger(__name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Пропускаем OPTIONS запросы (preflight CORS)
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
            
        auth_header = request.headers.get('Authorization')
        token = None
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            token = request.args.get('token')
        
        if not token:
            logger.warning("Token not provided")
            return jsonify({"error": "Token is required"}), 401

        try:
            decoded = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[JWT_ALGORITHM],
                options={"verify_exp": True}
            )
            request.current_user = decoded.get('username') or decoded.get('id')
            if not request.current_user:
                raise jwt.InvalidTokenError("Username not found in token")
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return jsonify({"error": "Token expired. Please login again."}), 401
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return jsonify({"error": "Token verification failed"}), 401

        return f(*args, **kwargs)
    return decorated

@assistant_bp.route('/events', methods=['GET'], endpoint='assistant_events')
@token_required
def get_events():
    """SSE endpoint для передачи событий ассистента"""
    username = request.current_user
    
    def event_stream():
        try:
            while True:
                time.sleep(0.3)
                
                with manager._lock:
                    messages = manager.unread_messages[username].copy()
                    manager.unread_messages[username] = []
                
                if messages:
                    data = json.dumps({
                        'messages': messages,
                        'timestamp': datetime.now().isoformat()
                    })
                    yield f"data: {data}\n\n"
                
        except GeneratorExit:
            logger.info("SSE соединение закрыто клиентом")
        except Exception as e:
            logger.error(f"Ошибка в SSE потоке: {str(e)}")

    return Response(
        event_stream(),
        mimetype="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

@assistant_bp.route('/start_voice_assistant', methods=['POST'], endpoint='start_assistant')
@token_required
def start_voice_assistant():
    """Запуск голосового ассистента"""
    username = request.current_user
    try:
        if manager.start(username):
            return jsonify({
                'status': 'listening',
                'message': 'Ассистент активирован. Скажите команду.'
            })
        return jsonify({
            'status': 'error',
            'message': 'Ассистент уже запущен'
        })
    except Exception as e:
        logger.error(f"Ошибка запуска ассистента: {str(e)}")
        return jsonify({'error': str(e)}), 500

@assistant_bp.route('/stop_voice_assistant', methods=['POST'], endpoint='stop_assistant')
@token_required
def stop_voice_assistant():
    """Остановка голосового ассистента"""
    username = request.current_user
    try:
        manager.stop()
        return jsonify({
            "status": "stopped",
            "message": "Ассистент остановлен"
        })
    except Exception as e:
        logger.error(f"Ошибка остановки: {str(e)}")
        return jsonify({"error": str(e)}), 500

@assistant_bp.route('/process_command', methods=['POST'], endpoint='process_command')
@token_required
def process_command():
    """Обработка команды с фронта"""
    username = request.current_user
    command = request.json.get('command', '').strip()
    
    if not command:
        return jsonify({'error': 'Пустая команда'}), 400
    
    try:
        # Передаем команду и username в менеджер
        response = manager._execute_command(command=command, username=username)
        
        # Сохраняем сообщения
        command_msg = {
            'text': command,
            'sender': 'user',
            'isVoice': True,
            'timestamp': datetime.now().isoformat(),
            'type': 'command'
        }
        
        response_msg = {
            'text': response,
            'sender': 'assistant',
            'timestamp': datetime.now().isoformat(),
            'type': 'response'
        }
        
        with manager._lock:
            manager.message_history[username].extend([command_msg, response_msg])
            manager.unread_messages[username].extend([command_msg, response_msg])
        
        return jsonify({
            'response': response,
            'status': 'completed'
        })
        
    except Exception as e:
        logger.error(f"Ошибка выполнения команды: {str(e)}")
        return jsonify({'error': str(e)}), 500


@assistant_bp.route('/chat', methods=['POST'])
@token_required
def chat_handler():
    """Основной endpoint для чата с ассистентом"""
    username = request.current_user
    data = request.get_json()
    
    if not data or 'command' not in data:
        return jsonify({'error': "Field 'command' is required"}), 400
        
    command = data['command'].strip()
    if not command:
        return jsonify({'error': 'Пустая команда'}), 400
    
    try:
        # Сначала пробуем распарсить как команду
        parsed_command = parse_command(command, username)
        
        if parsed_command:
            # Если это команда - выполняем ее
            response_text = execute_command(
                parsed_command['action'],
                parsed_command['target'],
                parsed_command.get('app_path'),
                username
            )
            message_type = 'command_response'
        else:
            # Если не команда - обрабатываем как обычный запрос
            ai_response = process_user_query(command, username, manager)
            ai_response = ai_response['response']
            response_text = ai_response if isinstance(ai_response, str) else str(ai_response)
            message_type = 'ai_response'
        
        # Сохраняем сообщения
        command_msg = {
            'text': command,
            'sender': 'user',
            'isVoice': False,
            'timestamp': datetime.now().isoformat(),
            'type': 'command'
        }
        
        response_msg = {
            'text': response_text,
            'sender': 'assistant',
            'timestamp': datetime.now().isoformat(),
            'type': message_type
        }
        
        with manager._lock:
            manager.message_history[username].extend([command_msg, response_msg])
            manager.unread_messages[username].extend([command_msg, response_msg])
        
        return jsonify({
            'response': response_text,
            'status': 'completed',
            'messages': [command_msg, response_msg],
            'is_command': bool(parsed_command)
        })
        
    except Exception as e:
        logger.error(f"Ошибка выполнения команды: {str(e)}")
        return jsonify({'error': str(e)}), 500