from flask import Blueprint, request, jsonify, session, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from database import db, User
from utils.helpers import hash_password, verify_password
from utils.decorators import validate_request_json
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength (min 8 chars, at least one uppercase, one digit)"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

@auth_bp.route('/signup', methods=['POST'])
@validate_request_json(['name', 'email', 'password', 'role'])
def signup():
    """User signup endpoint"""
    data = request.get_json()
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'student')
    
    # Validation
    if not name or len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters long'}), 400
    
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    is_valid, msg = validate_password(password)
    if not is_valid:
        return jsonify({'error': msg}), 400
    
    if role not in ['student', 'instructor', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    try:
        new_user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Log in the user
        login_user(new_user)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500
    

@auth_bp.route('/login', methods=['POST'])
@validate_request_json(['email', 'password'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    # Validate input
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    try:
        # Log in the user
        login_user(user)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user profile"""
    if current_user.is_authenticated:
        return jsonify({'user': current_user.to_dict()}), 200
    else:
        return jsonify({'user': None}), 200

@auth_bp.route('/profile', methods=['PUT'])
@login_required
@validate_request_json(['name'])
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        
        if 'name' in data:
            name = data['name'].strip()
            if len(name) < 2:
                return jsonify({'error': 'Name must be at least 2 characters long'}), 400
            current_user.name = name
        
        if 'photo_url' in data:
            current_user.photo_url = data['photo_url']
        
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Profile update failed: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@login_required
@validate_request_json(['old_password', 'new_password'])
def change_password():
    """Change user password"""
    try:
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        # Verify old password
        if not verify_password(old_password, current_user.password_hash):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        is_valid, msg = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': msg}), 400
        
        # Update password
        current_user.password_hash = hash_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Password change failed: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """User logout"""
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200
