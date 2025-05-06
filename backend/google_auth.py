from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Настройки OAuth2
CLIENT_SECRETS_FILE = "./data/conf_google.json"  # Файл с клиентскими секретами
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
]

REDIRECT_URI = "http://localhost:5000/auth/google/callback"

def get_flow():
    """
    Создает и возвращает объект Flow для авторизации через Google OAuth 2.0.
    """
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    return flow

def get_user_info(token):
    """
    Возвращает информацию о пользователе из Google API.
    """
    credentials = Credentials(token['access_token'])
    service = build("oauth2", "v2", credentials=credentials)
    user_info = service.userinfo().get().execute()
    return user_info