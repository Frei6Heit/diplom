from flask import Blueprint, request, jsonify
import json
import os
import webbrowser
from pathlib import Path
import subprocess
import platform
import logging
from openai import OpenAI
from datetime import datetime
import jwt
from functools import wraps
import speech_recognition as sr
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from utils.auth_utils import decode_jwt

AUDIO_UPLOAD_FOLDER = 'uploads/audio'
os.makedirs(AUDIO_UPLOAD_FOLDER, exist_ok=True)

# Конфигурация JWT
SECRET_KEY = "2cf07d92ee8936c4b93ff3bc52feeff891318a41f91ba8562d06212a3d1f1a42"  # Замените на реальный секретный ключ
JWT_ALGORITHM = "HS256"

# Инициализация клиента OpenAI
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Пути к файлам
BASE_DIR = Path(__file__).parent.parent.parent
SETTINGS_PATH = BASE_DIR / 'data' / 'users.json'
logger.info(f"Settings path: {SETTINGS_PATH}")

# Создаем Blueprint для ассистента
assistant_bp = Blueprint('assistant', __name__, url_prefix='/api/assistant')

def token_required(f):
    """Декоратор для проверки JWT токена"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Missing or invalid Authorization header")
            return jsonify({"error": "Authorization header with Bearer token required"}), 401

        token = auth_header.split(' ')[1]
        if not token:
            logger.warning("Empty token received")
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

def load_user_settings():
    """Загружает настройки всех пользователей из файла"""
    try:
        if not SETTINGS_PATH.exists():
            logger.warning(f"Файл настроек не найден: {SETTINGS_PATH}")
            return {}

        with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            if isinstance(data, list):
                return {user['username']: user for user in data if 'username' in user}
            elif isinstance(data, dict):
                return data
            else:
                logger.error(f"Неверный формат данных в {SETTINGS_PATH}")
                return {}

    except Exception as e:
        logger.error(f"Ошибка загрузки настроек: {e}")
        return {}

def get_user_settings(username):
    """Загружает настройки для конкретного пользователя"""
    try:
        all_settings = load_user_settings()
        user_data = all_settings.get(username, {})
        
        settings = {}
        if 'settings' in user_data:
            settings.update(user_data['settings'])
        if 'apps' in user_data:
            settings['apps'] = user_data['apps']
        elif 'settings' in user_data and 'apps' in user_data['settings']:
            settings['apps'] = user_data['settings']['apps']
            
        logger.info(f"Настройки пользователя {username}: {settings}")
        return settings
        
    except Exception as e:
        logger.error(f"Ошибка получения настроек пользователя {username}: {e}")
        return {}

def save_user_settings(username, new_settings):
    """Сохраняет настройки пользователя"""
    try:
        SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        all_settings = load_user_settings()
        all_settings[username] = {
            **all_settings.get(username, {}),
            'settings': new_settings,
            'updated_at': datetime.now().isoformat()
        }
        
        with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(all_settings, f, ensure_ascii=False, indent=2)
        return True
        
    except Exception as e:
        logger.error(f"Ошибка сохранения настроек: {e}")
        return False

def execute_command(action, target=None, app_path=None, username=None):
    """Выполняет системные команды и управляет приложениями"""
    try:
        logger.info(f"Executing command: action={action}, target={target}, username={username}")

        if action in ["открой", "open", "запусти", "run", "start"]:
            if not app_path and username:
                user_settings = get_user_settings(username)
                for app in user_settings.get('apps', []):
                    app_name = app.get('name', '').lower()
                    triggers = [t.lower() for t in app.get('trigger_words', app.get('triggerWords', []))]
                    if target == app_name or target in triggers:
                        app_path = app.get('path')
                        if app_path:
                            break

            if app_path:
                if platform.system() == "Windows":
                    os.startfile(app_path)
                else:
                    subprocess.Popen([app_path])
                return f"Приложение {target} запущено"
            
            system_apps = {
                "калькулятор": "calc" if platform.system() == "Windows" else "gnome-calculator",
                "блокнот": "notepad" if platform.system() == "Windows" else "gedit",
                "браузер": "start chrome" if platform.system() == "Windows" else "google-chrome"
            }
            
            if target in system_apps:
                app = system_apps[target]
                subprocess.Popen(app.split() if isinstance(app, str) else app)
                return f"Системное приложение {target} запущено"
            
            return f"Не удалось найти приложение с именем {target}"

        elif action in ["закрой", "close", "stop", "выключи"]:
            if platform.system() == "Windows":
                subprocess.Popen(["taskkill", "/f", "/im", f"{target}.exe"])
            else:
                subprocess.Popen(["pkill", "-f", target])
            return f"Приложение {target} закрыто"

        elif action == "выключи" and target == "компьютер":
            if platform.system() == "Windows":
                subprocess.Popen(["shutdown", "/s", "/t", "0"])
            else:
                subprocess.Popen(["shutdown", "now"])
            return "Компьютер выключается"
        
        elif action == "перезагрузи" and target == "компьютер":
            if platform.system() == "Windows":
                subprocess.Popen(["shutdown", "/r", "/t", "0"])
            else:
                subprocess.Popen(["reboot"])
            return "Компьютер перезагружается"
        
        elif action == "создай" and target == "файл":
            filename = "новый_файл.txt"
            with open(filename, "w") as f:
                f.write("")
            return f"Файл {filename} создан"
        
        webbrowser.open(f"https://www.google.com/search?q={target}")
        return f"Поиск в интернете: {target}"

    except Exception as e:
        logger.error(f"Ошибка выполнения команды: {e}")
        return f"Не удалось выполнить команду: {e}"

def parse_command(query, username):
    """Анализирует команду пользователя и определяет действие"""
    query = query.lower().strip()
    commands = {
        "открой": ["открой", "open", "запусти", "run", "start"],
        "закрой": ["закрой", "close", "stop", "выключи"],
        "выключи": ["выключи", "shutdown", "off"],
        "перезагрузи": ["перезагрузи", "restart", "reboot"],
        "создай": ["создай", "create", "make"],
        "найди": ["найди", "ищи", "search", "find"]
    }
    
    user_apps = get_user_settings(username).get("apps", [])

    for action, keywords in commands.items():
        for keyword in keywords:
            if query.startswith(keyword):
                target = query[len(keyword):].strip()

                for app in user_apps:
                    app_name = app.get('name', '').lower()
                    triggers = [t.lower() for t in app.get('trigger_words', app.get('triggerWords', []))]
                    if target == app_name or any(t in target for t in triggers):
                        return {
                            "action": action,
                            "target": app_name,
                            "app_path": app.get("path"),
                            "type": "app_command"
                        }

                if action in ["выключи", "перезагрузи"] and "компьютер" in target:
                    return {
                        "action": action,
                        "target": "компьютер",
                        "type": "system_command"
                    }

                return {
                    "action": action,
                    "target": target,
                    "type": "general_command"
                }
    return None

# Добавляем в начало файла


# Добавляем новые роуты
@assistant_bp.route('/audio', methods=['POST'])
def handle_audio():
    # Проверка авторизации
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token is missing"}), 401
    
    try:
        token = token.split(" ")[1]
        decode_jwt(token)  # Проверяем токен
    except:
        return jsonify({"error": "Invalid token"}), 401

    # Обработка аудио
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        # Сохраняем временный файл
        filename = secure_filename(f"{datetime.now().timestamp()}.webm")
        filepath = os.path.join(AUDIO_UPLOAD_FOLDER, filename)
        audio_file.save(filepath)
        
        # Преобразуем аудио в текст
        r = sr.Recognizer()
        with sr.AudioFile(filepath) as source:
            audio = r.record(source)
            text = r.recognize_google(audio, language='ru-RU')
        
        # Удаляем временный файл
        os.remove(filepath)
        
        # Обрабатываем текст как обычный запрос
        response = {
            "response": f"Ответ на аудио: {text}",
            "command": None,
            "app_path": None,
            "original_audio_text": text
        }
        return jsonify(response)
        
    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand audio"}), 400
    except sr.RequestError as e:
        return jsonify({"error": f"Speech recognition error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@assistant_bp.route('/chat', methods=['POST'])
@token_required
def handle_chat():
    try:
        data = request.get_json()
        if not data:
            logger.warning("Request body is empty")
            return jsonify({"error": "Request body is empty"}), 400

        query = data.get('query', '').strip()
        if not query:
            logger.warning("Query is empty")
            return jsonify({"error": "Query is empty"}), 400

        username = request.current_user
        logger.info(f"User '{username}' sent query: {query}")

        # Попытка распознать команду
        command = parse_command(query, username)
        if command:
            result = execute_command(
                command["action"],
                command["target"],
                command.get("app_path"),
                username
            )
            return jsonify({
                "response": result,
                "type": command["type"],
                "command": command["action"],
                "status": "success"
            })

        # Не выполнять запуск приложений по совпадению ключевых слов без управляющей команды
        logger.info("Команда не распознана как управляющая. Отправляем запрос в ИИ.")

        # Отправка запроса в OpenAI
        messages = [
            {"role": "system", "content": "Ты полезный ассистент. Отвечай на языке пользователя."},
            {"role": "user", "content": query}
        ]

        try:
            response = client.chat.completions.create(
                model="mistralai/mistral-small-3.1-24b-instruct:free",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            content = response.choices[0].message.content if response.choices else "Извините, не удалось получить ответ."
        except Exception as ai_error:
            logger.error(f"Ошибка при обращении к OpenAI: {ai_error}")
            content = "Извините, возникла проблема при обработке ответа ИИ."

        return jsonify({
            "response": content,
            "type": "ai_response",
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Ошибка обработки запроса: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
