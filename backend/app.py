from flask import Flask, jsonify, redirect, url_for, session, request
from flask_cors import CORS
from google_auth import get_flow, get_user_info
import os
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.secret_key = 'YOUR_SECRET_KEY'  # Set a secret key for session management

# JWT configuration
app.config['JWT_SECRET'] = 'YOUR_JWT_SECRET'  # Secret key for signing JWTs

# Allow HTTP for local development (remove in production)
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Example API endpoint.
    """
    return jsonify({"message": "Hello from Python backend!"})

@app.route('/auth/google')
def login():
    """
    Redirect the user to Google's OAuth2 consent page.
    """
    flow = get_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state  # Save the state in the session
    return redirect(authorization_url)

@app.route('/auth/google/callback')
def callback():
    """
    Handle the callback from Google OAuth2 and generate a JWT.
    """
    state = session['state']
    flow = get_flow()
    flow.fetch_token(authorization_response=request.url)

    # Get user info
    credentials = flow.credentials
    user_info = get_user_info(credentials)

    # Generate a JWT
    token = jwt.encode({
        'id': user_info['id'],
        'name': user_info['name'],
        'email': user_info['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expiration
    }, app.config['JWT_SECRET'], algorithm='HS256')

    # Redirect to the frontend with the JWT
    return redirect(f'http://localhost:3000/auth/success?token={token}')

@app.route('/auth/user')
def get_user():
    """
    Verify the JWT and return user information.
    """
    token = request.args.get('token')
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        # Decode the JWT
        data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        return jsonify(data)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

if __name__ == '__main__':
    app.run(debug=True)