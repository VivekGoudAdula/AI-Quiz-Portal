
from flask import Blueprint, request, jsonify
from flask_login import current_user
from database import db, Question, QuestionOption
from utils.decorators import token_required, role_required, validate_request_json

instructor_bp = Blueprint('instructor', __name__)


@instructor_bp.route('/questions', methods=['POST'])
@token_required
@role_required('instructor', 'admin')
@validate_request_json(['text', 'type', 'difficulty'])
def create_question():
    """Create new question"""
    try:
        user_id = current_user.id
        data = request.get_json()
        
        print(f"[DEBUG] Received question data: {data}")
        
        question_type = data.get('type')
        if question_type not in ['mcq', 'true_false', 'short_answer', 'long_answer']:
            return jsonify({'error': 'Invalid question type'}), 400
        
        text = data.get('text', '').strip()
        if not text or len(text) < 5:
            return jsonify({'error': 'Question text must be at least 5 characters'}), 400
        
        difficulty = data.get('difficulty')
        if difficulty not in ['easy', 'medium', 'hard']:
            return jsonify({'error': 'Invalid difficulty level'}), 400
        
        # Create question
        new_question = Question(
            text=text,
            type=question_type,
            difficulty=difficulty,
            marks=data.get('marks', 1.0),
            tags=data.get('tags', []),
            explanation=data.get('explanation', ''),
            created_by_id=user_id
        )
        
        db.session.add(new_question)
        db.session.flush()
        
        # Add options for MCQ and True/False
        if question_type in ['mcq', 'true_false']:
            options = data.get('options', [])
            print(f"[DEBUG] Options received: {options}")
            
            if not options or len(options) < 2:
                return jsonify({'error': 'Question must have at least 2 options'}), 400
            
            correct_count = sum(1 for opt in options if opt.get('isCorrect'))
            print(f"[DEBUG] Correct answers count: {correct_count}")
            
            if correct_count == 0:
                return jsonify({'error': 'Question must have at least one correct answer'}), 400
            
            for opt in options:
                option = QuestionOption(
                    question_id=new_question.id,
                    text=opt.get('text', '').strip(),
                    is_correct=opt.get('isCorrect', False)
                )
                db.session.add(option)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Question created successfully',
            'question': new_question.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to create question: {str(e)}")
        return jsonify({'error': str(e)}), 500

@instructor_bp.route('/questions/<question_id>', methods=['GET'])
@token_required
def get_question(question_id):
    """Get question details"""
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        return jsonify({'question': question.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@instructor_bp.route('/questions/<question_id>', methods=['PUT'])
@token_required
@role_required('instructor', 'admin')
def update_question(question_id):
    """Update question"""
    try:
        user_id = current_user.id
        question = Question.query.get(question_id)
        
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        if question.created_by_id != user_id:
            return jsonify({'error': 'You can only edit your own questions'}), 403
        
        data = request.get_json()
        
        if 'text' in data:
            text = data['text'].strip()
            if len(text) < 5:
                return jsonify({'error': 'Question text must be at least 5 characters'}), 400
            question.text = text
        
        if 'difficulty' in data:
            if data['difficulty'] not in ['easy', 'medium', 'hard']:
                return jsonify({'error': 'Invalid difficulty level'}), 400
            question.difficulty = data['difficulty']
        
        if 'marks' in data:
            question.marks = max(0.5, data['marks'])
        
        if 'tags' in data:
            question.tags = data['tags']
        
        if 'explanation' in data:
            question.explanation = data['explanation']
        
        # Update options if provided
        if 'options' in data and question.type in ['mcq', 'true_false']:
            options = data['options']
            correct_count = sum(1 for opt in options if opt.get('isCorrect'))
            if correct_count == 0:
                return jsonify({'error': 'Question must have at least one correct answer'}), 400
            
            # Delete existing options
            QuestionOption.query.filter_by(question_id=question_id).delete()
            
            # Add new options
            for opt in options:
                option = QuestionOption(
                    question_id=question_id,
                    text=opt.get('text', '').strip(),
                    is_correct=opt.get('isCorrect', False)
                )
                db.session.add(option)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Question updated successfully',
            'question': question.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@instructor_bp.route('/questions/<question_id>', methods=['DELETE'])
@token_required
@role_required('instructor', 'admin')
def delete_question(question_id):
    """Delete question"""
    try:
        user_id = current_user.id
        question = Question.query.get(question_id)
        
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        if question.created_by_id != user_id:
            return jsonify({'error': 'You can only delete your own questions'}), 403
        
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({'message': 'Question deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@instructor_bp.route('/questions', methods=['GET'])
@token_required
@role_required('instructor', 'admin')
def list_questions():
    """List user's questions with filtering"""
    try:
        user_id = current_user.id
        difficulty = request.args.get('difficulty')
        tag = request.args.get('tag')
        
        query = Question.query.filter_by(created_by_id=user_id)
        
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        
        if tag:
            query = query.filter(Question.tags.contains([tag]))
        
        questions = query.all()
        
        return jsonify({
            'questions': [q.to_dict() for q in questions],
            'total': len(questions)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@instructor_bp.route('/analytics/<quiz_id>', methods=['GET'])
@token_required
@role_required('instructor', 'admin')
def get_quiz_analytics(quiz_id):
    """Get detailed analytics for a quiz"""
    try:
        from database import Quiz, Attempt
        
        user_id = current_user.id
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        if quiz.created_by_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get all attempts for this quiz
        attempts = Attempt.query.filter_by(quiz_id=quiz_id, is_submitted=True).all()
        
        if not attempts:
            return jsonify({
                'quizId': quiz_id,
                'totalAttempts': 0,
                'averageScore': 0,
                'passPercentage': 0,
                'performance': []
            }), 200
        
        # Calculate analytics
        total_attempts = len(attempts)
        scores = [a.final_score for a in attempts if a.final_score is not None]
        average_score = sum(scores) / len(scores) if scores else 0
        
        passed = sum(1 for s in scores if s >= quiz.passing_score)
        pass_percentage = (passed / len(scores) * 100) if scores else 0
        
        # Performance by question
        question_performance = {}
        for attempt in attempts:
            for answer in attempt.answers:
                if answer.question_id not in question_performance:
                    question_performance[answer.question_id] = {
                        'correct': 0,
                        'total': 0,
                        'avgTime': 0
                    }
                question_performance[answer.question_id]['total'] += 1
                if answer.is_correct:
                    question_performance[answer.question_id]['correct'] += 1
                question_performance[answer.question_id]['avgTime'] += answer.time_spent_seconds
        
        # Calculate accuracy per question
        performance = []
        for qid, stats in question_performance.items():
            accuracy = (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0
            avg_time = stats['avgTime'] / stats['total'] if stats['total'] > 0 else 0
            
            question = Question.query.get(qid)
            if question:
                performance.append({
                    'questionId': qid,
                    'questionText': question.text[:50] + '...',
                    'accuracy': round(accuracy, 2),
                    'totalAttempts': stats['total'],
                    'averageTime': round(avg_time, 2),
                    'difficulty': question.difficulty
                })
        
        return jsonify({
            'quizId': quiz_id,
            'totalAttempts': total_attempts,
            'averageScore': round(average_score, 2),
            'passPercentage': round(pass_percentage, 2),
            'performance': sorted(performance, key=lambda x: x['accuracy'])
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@instructor_bp.route('/dashboard-stats', methods=['GET'])
@token_required
@role_required('instructor', 'admin')
def get_dashboard_stats():
    """Return instructor dashboard stats: total quizzes, total students, avg performance, active quizzes"""
    user_id = current_user.id
    from datetime import datetime
    now = datetime.utcnow()
    quizzes = db.session.query(Question).filter_by(created_by_id=user_id).all()
    # If you have a Quiz model, use Quiz.query.filter_by(created_by_id=user_id).all()
    try:
        from database import Quiz, Attempt
        quizzes = Quiz.query.filter_by(created_by_id=user_id).all()
        total_quizzes = len(quizzes)
        quiz_ids = [q.id for q in quizzes]
        student_ids = set()
        attempts = Attempt.query.filter(Attempt.quiz_id.in_(quiz_ids), Attempt.is_submitted==True).all()
        for a in attempts:
            student_ids.add(a.user_id)
        total_students = len(student_ids)
        scores = [a.final_score/a.total_marks*100 for a in attempts if a.final_score is not None and a.total_marks]
        avg_performance = round(sum(scores)/len(scores), 2) if scores else 0
        active_quizzes = sum(1 for q in quizzes if q.start_time <= now <= q.end_time)
        return jsonify({
            'totalQuizzes': total_quizzes,
            'totalStudents': total_students,
            'avgPerformance': avg_performance,
            'activeQuizzes': active_quizzes
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
