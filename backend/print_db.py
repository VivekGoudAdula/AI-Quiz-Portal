from app import app
from database import db, User, Quiz, Question, Attempt

with app.app_context():
    print('Users:')
    for user in User.query.all():
        print(user.to_dict())
    print('\nQuizzes:')
    for quiz in Quiz.query.all():
        print(quiz.to_dict())
    print('\nQuestions:')
    for question in Question.query.all():
        print(question.to_dict())
    print('\nAttempts:')
    for attempt in Attempt.query.all():
        print(attempt.id, attempt.user_id, attempt.quiz_id, attempt.final_score)
