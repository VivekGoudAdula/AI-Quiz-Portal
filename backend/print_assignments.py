# Print all quiz assignments for a user
from backend.database import db, QuizAssignment

USER_ID = 'f7fd2ff9-a2a2-429e-84d8-82b477da7eff'  # Replace with your user_id

assignments = QuizAssignment.query.filter_by(student_id=USER_ID).all()
for a in assignments:
    print(f"QuizAssignment: quiz_id={a.quiz_id}, student_id={a.student_id}, assigned_by_id={a.assigned_by_id}, due_date={a.due_date}")
print(f"Total assignments for user {USER_ID}: {len(assignments)}")
