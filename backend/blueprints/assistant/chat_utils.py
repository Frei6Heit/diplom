# blueprints/assistant/chat_utils.py

import json
import os
import subprocess
import platform
import logging
import webbrowser
from pathlib import Path

logger = logging.getLogger(__name__)

# Путь к users.json в папке data
USER_JSON_PATH = Path(__file__).parent.parent.parent / 'data' / 'users.json'

# Ключевые слова для запуска приложений
COMMAND_TRIGGERS = ['открой', 'открыть', 'запусти', 'запустить']

# Явные маппинги для сайтов
SITE_URLS = {
    'вк': 'https://vk.com',
    'vk': 'https://vk.com',
    'youtube': 'https://youtube.com',
    # Добавь нужные сайты
}

_cached_users = None

def _load_users_data():
    global _cached_users
    if _cached_users is None:
        try:
            with open(USER_JSON_PATH, 'r', encoding='utf-8') as f:
                _cached_users = json.load(f)
        except Exception as e:
            logger.error(f"Не удалось загрузить users.json по пути {USER_JSON_PATH}: {e}")
            _cached_users = []
    return _cached_users


def _get_user_apps(username: str):
    users = _load_users_data()
    for u in users:
        if u.get('username') == username:
            apps = u.get('apps') or u.get('settings', {}).get('apps') or []
            return apps
    return []


def parse_command(query: str, username: str):
    """
    Обрабатывает команды запуска приложений или сайтов.

    Всегда возвращает dict для запросов, начинающихся с триггера, даже если приложение не найдено в JSON.
    """
    text = query.lower().strip()
    for trigger in COMMAND_TRIGGERS:
        if text.startswith(trigger):
            app_name = text[len(trigger):].strip()
            # Проверяем приложения пользователя
            apps = _get_user_apps(username)
            for app in apps:
                if any(word.lower() == app_name for word in app.get('triggerWords', [])):
                    return {
                        'action': 'open',
                        'target': app.get('name'),
                        'app_path': app.get('path'),
                        'type': 'command'
                    }
            # Проверяем известные сайты
            if app_name in SITE_URLS:
                return {
                    'action': 'open',
                    'target': app_name,
                    'app_path': SITE_URLS[app_name],
                    'type': 'command'
                }
            # По умолчанию: открываем браузер с поисковым запросом
            search_url = f"https://www.google.com/search?q={app_name.replace(' ', '+')}"
            return {
                'action': 'open',
                'target': app_name,
                'app_path': search_url,
                'type': 'command'
            }
    return None


def execute_command(action: str, target: str, app_path: str, username: str) -> str:
    """
    Выполняет команду открытия приложения или сайта.
    """
    if action != 'open':
        return f"Неизвестное действие {action}"
    try:
        # Открываем сайт или поиск
        if app_path.startswith('http://') or app_path.startswith('https://'):
            webbrowser.open(app_path)
            # Если это поисковый запрос или сайт
            if 'google.com/search' in app_path:
                return f"Ищем в браузере: {target}"
            return f"Открываю сайт {target}"
        # Открываем приложение
        if os.path.exists(app_path):
            system = platform.system()
            if system == 'Windows':
                os.startfile(app_path)
            elif system == 'Darwin':  # macOS
                subprocess.Popen(['open', app_path])
            else:
                subprocess.Popen([app_path])
            return f"Открываю приложение {target}"
        else:
            return f"Путь не найден: {app_path}"
    except Exception as e:
        logger.error(f"Ошибка при выполнении команды {action} для {target}: {e}")
        return f"Ошибка при запуске {target}: {e}"
