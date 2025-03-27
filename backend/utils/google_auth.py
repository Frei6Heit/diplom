from google_auth_oauthlib.flow import Flow
from flask import session
import os

def get_flow():
    flow = Flow.from_client_secrets_file(
        'client_secret.json',
        scopes=['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        redirect_uri='http://localhost:5000/auth/google/callback'
    )
    return flow

def get_user_info(token):
    import requests
    user_info = requests.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        headers={'Authorization': f'Bearer {token["access_token"]}'}
    ).json()
    return user_info