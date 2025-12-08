from functools import wraps
from flask import jsonify
from flask_login import login_required, current_user

# Alias for backward compatibility
token_required = login_required

def role_required(*allowed_roles):
    """Decorator to require specific user roles"""
    def decorator(f):
        @wraps(f)
        @login_required
        def decorated(*args, **kwargs):
            if current_user.role not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def validate_request_json(required_fields):
    """Decorator to validate JSON request has required fields"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            from flask import request
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'Request body is required'}), 400
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
            
            return f(*args, **kwargs)
        return decorated
    return decorator
