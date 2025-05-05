from flask import Flask
from flasgger import Swagger
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['messages'] = {} 
CORS(app, resources={
    r"/api/assistant/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Конфигурация
app.config.update({
    'SECRET_KEY': os.getenv('FLASK_SECRET_KEY'),
    'JWT_SECRET': os.getenv('JWT_SECRET'),
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB
    'JSONIFY_PRETTYPRINT_REGULAR': True
})

# Swagger
Swagger(app, template={
    "info": {
        "title": "Voice Assistant API",
        "version": "1.0",
        "description": "API для голосового ассистента"
    }
})


# Регистрация Blueprints
from blueprints.auth.routes import auth_bp
from blueprints.apps.routes import apps_bp
from blueprints.search.routes import search_bp
from blueprints.assistant.routes import assistant_bp  # Изменено с assistant на assistant_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(apps_bp, url_prefix='/api')
app.register_blueprint(search_bp, url_prefix='/api')
app.register_blueprint(assistant_bp, url_prefix='/api/assistant')  # Теперь регистрируем Blueprint

if __name__ == '__main__':
    app.run(debug=True)