from flask import Flask
from flasgger import Swagger
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Загрузка переменных окружения
load_dotenv()

# Инициализация приложения
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Конфигурация
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')
app.config['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Для разработки

# Настройка Swagger
app.config['SWAGGER'] = {
    'title': 'Voice Assistant API',
    'version': '1.0',
    'uiversion': 3,
    'specs_route': '/docs/'
}
Swagger(app)

# Регистрация Blueprints
from blueprints.auth.routes import auth_bp
from blueprints.apps.routes import apps_bp
from blueprints.search.routes import search_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(apps_bp, url_prefix='/api')
app.register_blueprint(search_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)