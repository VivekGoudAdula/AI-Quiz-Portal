"""
Script to seed initial quizzes into the database
"""
from datetime import datetime, timedelta
from app import app, db
from database import Quiz, User

def seed_quizzes():
    """Create sample quizzes"""
    with app.app_context():
        # Get the instructor user (or create one)
        instructor = User.query.filter_by(role='instructor').first()
        
        if not instructor:
            print("❌ No instructor found! Create an instructor account first.")
            return
        
        print(f"✓ Found instructor: {instructor.name}")
        
        # Delete existing quizzes to avoid duplicates
        Quiz.query.delete()
        db.session.commit()
        print("✓ Cleared old quizzes")
        
        # Create quizzes
        now = datetime.utcnow()
        
        quizzes_data = [
            {
                'title': 'FRONTEND DEVELOPMENT',
                'description': 'A comprehensive quiz covering essential concepts in modern frontend development. Test your knowledge of HTML, CSS, JavaScript, and UI best practices.',
                'duration': 1800,  # 30 minutes
                'start_offset': -3600,  # Started 1 hour ago
                'end_offset': 86400,  # Ends in 24 hours
            },
            {
                'title': 'PYTHON',
                'description': 'Test your Python programming knowledge with questions on fundamentals, OOP, and best practices.',
                'duration': 1800,
                'start_offset': -3600,
                'end_offset': 86400,
            },
        ]
        
        for quiz_data in quizzes_data:
            quiz = Quiz(
                title=quiz_data['title'],
                description=quiz_data['description'],
                created_by_id=instructor.id,
                start_time=now + timedelta(seconds=quiz_data['start_offset']),
                end_time=now + timedelta(seconds=quiz_data['end_offset']),
                duration_seconds=quiz_data['duration'],
                shuffle_questions=False,
                shuffle_options=False,
                adaptive=False,
                proctoring_enabled=False,
                passing_score=60.0
            )
            db.session.add(quiz)
            print(f"✓ Created: {quiz.title}")
        
        db.session.commit()
        print("\n✅ All quizzes created successfully!")

if __name__ == '__main__':
    seed_quizzes()
