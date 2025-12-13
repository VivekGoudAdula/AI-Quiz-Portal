from flask import Blueprint, request, jsonify
from flask import g
from database import db, User, Attempt, Quiz, ProctoringEvent
from utils.decorators import token_required, role_required
from datetime import datetime, timedelta
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required('admin', 'instructor')
def list_users():
    """List all users"""
    try:
        role_filter = request.args.get('role')
        search = request.args.get('search', '').lower()
        
        query = User.query
        
        if role_filter:
            query = query.filter_by(role=role_filter)
        
        if search:
            query = query.filter(
                (User.name.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%'))
            )
        
        users = query.all()
        
        return jsonify({
            'users': [u.to_dict() for u in users],
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/role', methods=['PUT'])
@token_required
@role_required('admin')
def update_user_role(user_id):
    """Update user role"""
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['student', 'instructor', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/flagged-attempts', methods=['GET'])
@token_required
@role_required('admin')
def get_flagged_attempts():
    """Get flagged attempts (high suspicion score)"""
    try:
        threshold = float(request.args.get('threshold', 2.0))
        
        flagged = Attempt.query.filter(Attempt.suspicion_score >= threshold).all()
        
        attempts = []
        for attempt in flagged:
            attempts.append({
                'attemptId': attempt.id,
                'userId': attempt.user_id,
                'studentName': attempt.student.name,
                'quizId': attempt.quiz_id,
                'quizTitle': attempt.quiz.title,
                'startTime': int(attempt.start_time.timestamp() * 1000),
                'endTime': int(attempt.end_time.timestamp() * 1000) if attempt.end_time else None,
                'suspicionScore': attempt.suspicion_score,
                'warnings': attempt.warnings,
                'finalScore': attempt.final_score
            })
        
        return jsonify({
            'flaggedAttempts': attempts,
            'total': len(attempts)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/attempts/<attempt_id>/flag', methods=['POST'])
@token_required
@role_required('admin')
def flag_attempt(attempt_id):
    """Flag an attempt for review"""
    try:
        data = request.get_json()
        reason = data.get('reason', 'Manual review requested')
        
        attempt = Attempt.query.get(attempt_id)
        if not attempt:
            return jsonify({'error': 'Attempt not found'}), 404
        
        # Flag by setting high suspicion score if not already flagged
        if attempt.suspicion_score < 5.0:
            attempt.suspicion_score = 5.0
        
        # Create event to record the flag
        event = ProctoringEvent(
            attempt_id=attempt_id,
            user_id=get_jwt_identity(),
            event_type='admin-flag',
            timestamp=datetime.utcnow(),
            meta={'reason': reason},
            severity='critical'
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({
            'message': 'Attempt flagged',
            'attempt': attempt.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@token_required
@role_required('admin')
def get_system_analytics():
    """Get system-wide analytics"""
    try:
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_instructors = User.query.filter_by(role='instructor').count()
        total_quizzes = Quiz.query.count()
        total_attempts = Attempt.query.count()
        
        # Recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_attempts = Attempt.query.filter(Attempt.start_time >= week_ago).count()
        
        # Average score
        all_scores = [a.final_score for a in Attempt.query.all() if a.final_score is not None]
        avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
        
        # Most proctoring events
        event_counts = db.session.query(
            ProctoringEvent.event_type,
            func.count(ProctoringEvent.id)
        ).group_by(ProctoringEvent.event_type).all()
        
        return jsonify({
            'totalUsers': total_users,
            'totalStudents': total_students,
            'totalInstructors': total_instructors,
            'totalQuizzes': total_quizzes,
            'totalAttempts': total_attempts,
            'recentAttempts': recent_attempts,
            'averageScore': round(avg_score, 2),
            'proctorEventCounts': {event_type: count for event_type, count in event_counts}
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/system/reset', methods=['POST'])
@token_required
@role_required('admin')
def reset_system():
    """Reset system data (use with caution)"""
    try:
        data = request.get_json()
        confirm = data.get('confirm', False)
        
        if not confirm:
            return jsonify({'error': 'Confirmation required'}), 400
        
        # Log the reset action
        reset_by = get_jwt_identity()
        user = User.query.get(reset_by)
        
        # Clear all attempts and their related data
        Attempt.query.delete()
        ProctoringEvent.query.delete()
        
        db.session.commit()
        
        return jsonify({
            'message': f'System data reset by {user.email}',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
