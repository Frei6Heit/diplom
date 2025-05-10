from flask import Blueprint, request, jsonify
from flasgger import swag_from
import json
import os

apps_bp = Blueprint('apps', __name__)
TRIGGER_FILE = "./functions/dop_func/trigger.json"

@apps_bp.route('/add_app', methods=['POST'])
@swag_from({
    'tags': ['Apps'],
    'description': 'Добавление нового приложения',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'keyword': {'type': 'string'},
                    'link': {'type': 'string'}
                },
                'required': ['keyword', 'link']
            }
        }
    ],
    'responses': {
        200: {'description': 'Приложение успешно добавлено'},
        400: {'description': 'Неверные данные'},
        500: {'description': 'Ошибка сервера'}
    }
})
def add_app():
    data = request.get_json()
    keyword = data.get('keyword')
    link = data.get('link')

    if not keyword or not link:
        return jsonify({"error": "Keyword and link are required"}), 400

    try:
        with open(TRIGGER_FILE, "r", encoding="utf-8") as file:
            commands = json.load(file)

        for command in commands:
            if "app_mapping" in command:
                command["app_mapping"][keyword] = link
                break

        with open(TRIGGER_FILE, "w", encoding="utf-8") as file:
            json.dump(commands, file, ensure_ascii=False, indent=4)

        return jsonify({
            "message": f"Приложение '{keyword}' с ссылкой '{link}' успешно добавлено"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Ошибка: {str(e)}"}), 500
    
    
