from flask import Blueprint, request, jsonify
from flasgger import swag_from
import webbrowser

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['POST'])
@swag_from({
    'tags': ['Search'],
    'description': 'Обработка поискового запроса',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'query': {'type': 'string'}
                },
                'required': ['query']
            }
        }
    ],
    'responses': {
        200: {'description': 'Поисковый запрос обработан'},
        400: {'description': 'Неверные данные'}
    }
})
def search():
    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        webbrowser.open(f"https://yandex.ru/search/?text={query}")
        return jsonify({"message": f"Запрос '{query}' обработан"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500