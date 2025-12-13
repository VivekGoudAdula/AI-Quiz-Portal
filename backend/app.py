
import os
from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from dotenv import load_dotenv
from database import db
from routes.auth import auth_bp
from routes.quizzes import quizzes_bp
from routes.attempts import attempts_bp
from routes.proctoring import proctoring_bp
from routes.instructor import instructor_bp
from routes.admin import admin_bp
from routes.leaderboard import leaderboard_bp

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///quiz_portal.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Enable CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
CORS(app, resources={r"/api/*": {"origins": cors_origins, "supports_credentials": True}})

# Initialize LoginManager

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Custom unauthorized handler for API: return JSON 401 instead of redirect
@login_manager.unauthorized_handler
def unauthorized():
    from flask import request, jsonify
    # If the request is for API, return JSON 401
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Unauthorized'}), 401
    # Otherwise, fallback to default behavior (redirect)
    from flask import redirect, url_for
    return redirect(url_for('auth.login', next=request.url))


# Initialize Database
db.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    from database import User
    return User.query.get(user_id)


# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(quizzes_bp, url_prefix='/api/quizzes')
app.register_blueprint(attempts_bp, url_prefix='/api/attempts')
app.register_blueprint(proctoring_bp, url_prefix='/api/proctoring')
app.register_blueprint(instructor_bp, url_prefix='/api/instructor')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Resource not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'ok', 'message': 'Quiz Portal API is running'}, 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    app.run(host=host, port=port, debug=os.getenv('FLASK_DEBUG', True))
