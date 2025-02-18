import json
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Load Google OAuth2 configuration from config.json
with open('./data/conf_google.json', 'r') as f:
    config = json.load(f)

CLIENT_SECRETS_FILE = "./data/conf_google.json"
SCOPES = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid']
REDIRECT_URI = config['installed']['redirect_uris'][0]

def get_flow():
    """
    Create and return a Flow object for Google OAuth2.
    """
    return Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

def get_user_info(credentials):
    """
    Fetch user information using the provided credentials.
    """
    service = build('oauth2', 'v2', credentials=credentials)
    user_info = service.userinfo().get().execute()
    return user_info