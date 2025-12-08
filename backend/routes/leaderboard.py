from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from database import db, User, Attempt
from sqlalchemy import func

leaderboard_bp = Blueprint('leaderboard', __name__)


@leaderboard_bp.route('', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """
    Get leaderboard with student rankings based on quiz performance.
    Returns: rank, name, average score, total quizzes taken, ordered by score DESC
    """
    try:
        # Query to get student performance stats
        # Group by user, calculate avg score and count of attempts
        leaderboard_query = db.session.query(
            User.id,
            User.name,
            func.avg(Attempt.final_score).label('avg_score'),
            func.count(Attempt.id).label('quizzes_completed')
        ).join(
            Attempt, User.id == Attempt.user_id
        ).filter(
            User.role == 'student',
            Attempt.is_submitted == True,
            Attempt.final_score.isnot(None)
        ).group_by(
            User.id, User.name
        ).order_by(
            func.avg(Attempt.final_score).desc()
        ).all()

        # Build leaderboard response
        leaderboard = []
        for rank, (user_id, name, avg_score, quizzes_completed) in enumerate(leaderboard_query, 1):
            leaderboard.append({
                'rank': rank,
                'userId': user_id,
                'name': name,
                'score': round(avg_score, 1) if avg_score else 0,
                'quizzesCompleted': quizzes_completed
            })

        return jsonify({
            'leaderboard': leaderboard,
            'total': len(leaderboard)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@leaderboard_bp.route('/top/<int:limit>', methods=['GET'])
@jwt_required()
def get_top_performers(limit: int):
    """
    Get top N performers for the leaderboard.
    """
    try:
        if limit < 1 or limit > 100:
            limit = 10

        leaderboard_query = db.session.query(
            User.id,
            User.name,
            func.avg(Attempt.final_score).label('avg_score'),
            func.count(Attempt.id).label('quizzes_completed')
        ).join(
            Attempt, User.id == Attempt.user_id
        ).filter(
            User.role == 'student',
            Attempt.is_submitted == True,
            Attempt.final_score.isnot(None)
        ).group_by(
            User.id, User.name
        ).order_by(
            func.avg(Attempt.final_score).desc()
        ).limit(limit).all()

        leaderboard = []
        for rank, (user_id, name, avg_score, quizzes_completed) in enumerate(leaderboard_query, 1):
            leaderboard.append({
                'rank': rank,
                'userId': user_id,
                'name': name,
                'score': round(avg_score, 1) if avg_score else 0,
                'quizzesCompleted': quizzes_completed
            })

        return jsonify({
            'leaderboard': leaderboard,
            'total': len(leaderboard)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@leaderboard_bp.route('/my-rank', methods=['GET'])
@jwt_required()
def get_my_rank():
    """
    Get current user's rank in the leaderboard.
    """
    from flask_jwt_extended import get_jwt_identity
    
    try:
        user_id = get_jwt_identity()
        
        # Get all students ordered by avg score
        all_rankings = db.session.query(
            User.id,
            func.avg(Attempt.final_score).label('avg_score')
        ).join(
            Attempt, User.id == Attempt.user_id
        ).filter(
            User.role == 'student',
            Attempt.is_submitted == True,
            Attempt.final_score.isnot(None)
        ).group_by(
            User.id
        ).order_by(
            func.avg(Attempt.final_score).desc()
        ).all()

        # Find user's rank
        user_rank = None
        user_score = None
        total_students = len(all_rankings)

        for rank, (uid, avg_score) in enumerate(all_rankings, 1):
            if uid == user_id:
                user_rank = rank
                user_score = round(avg_score, 1) if avg_score else 0
                break

        if user_rank is None:
            return jsonify({
                'rank': None,
                'score': 0,
                'totalStudents': total_students,
                'message': 'Complete a quiz to appear on the leaderboard'
            }), 200

        return jsonify({
            'rank': user_rank,
            'score': user_score,
            'totalStudents': total_students,
            'percentile': round((total_students - user_rank + 1) / total_students * 100, 1) if total_students > 0 else 0
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
