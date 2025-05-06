from datetime import datetime
import logging
from openai import OpenAI
import os

from blueprints.assistant.chat_utils import parse_command, execute_command

logger = logging.getLogger(__name__)

_last_user_queries = {}

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


def process_user_query(query: str, username: str, manager, is_voice: bool = False) -> dict:
    global _last_user_queries

    result = {}
    current_time = datetime.now()

    # Очистим запрос от лишних пробелов и переведем в нижний регистр для сравнения
    clean_query = query.strip().lower()

    last_query_data = _last_user_queries.get(username)

    # Проверка на дублирование — только если текст совпадает и прошло <2 секунд
    if (
        last_query_data
        and (current_time - last_query_data["timestamp"]).total_seconds() < 2
        and last_query_data["query"] == clean_query
    ):
        logger.debug(f"[{username}] Дублирующий запрос: '{query}'")
        return {
            "response": "Этот запрос был только что отправлен. Попробуйте переформулировать.",
            "status": "duplicate"
        }

    # Сохраняем последний запрос
    _last_user_queries[username] = {"query": clean_query, "timestamp": current_time}

    # Добавляем сообщение от пользователя в историю
    manager.add_message(username, {
        "text": query,
        "sender": "user",
        "isVoice": is_voice,
        "timestamp": current_time.isoformat()
    })

    # Проверка: является ли это голосовая команда (например, открыть приложение)
    command = parse_command(query, username)
    if command:
        response_text = execute_command(
            command["action"],
            command["target"],
            command.get("app_path"),
            username
        )
        manager.add_message(username, {
            "text": response_text,
            "sender": "assistant",
            "type": command["type"],
            "timestamp": current_time.isoformat()
        })
        return {
            "response": response_text,
            "type": command["type"],
            "status": "success"
        }

    # Запрос в ИИ-модель (если не команда)
    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-small-3.1-24b-instruct:free",
            messages=[
                {"role": "system", "content": "Ты полезный ассистент. Отвечай на языке пользователя."},
                {"role": "user", "content": query}
            ],
            max_tokens=500,
            temperature=0.7
        )
        content = response.choices[0].message.content
    except Exception as e:
        logger.error(f"Ошибка ИИ: {e}")
        content = "Извините, возникла проблема при обработке запроса."

    manager.add_message(username, {
        "text": content,
        "sender": "assistant",
        "type": "ai_response",
        "timestamp": current_time.isoformat()
    })

    return {
        "response": content,
        "type": "ai_response",
        "status": "success"
    }
