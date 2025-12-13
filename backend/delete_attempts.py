# Utility script to delete all attempts for a specific user and quiz
from backend.database import db, Attempt

USER_ID = 'f7fd2ff9-a2a2-429e-84d8-82b477da7eff'  # Replace with your user_id
QUIZ_ID = '7bf333d8-140e-4909-bb75-0a3d360a9853'  # Replace with your quiz_id

attempts = Attempt.query.filter_by(user_id=USER_ID, quiz_id=QUIZ_ID).all()
for attempt in attempts:
    db.session.delete(attempt)
db.session.commit()
print(f"Deleted {len(attempts)} attempts for user {USER_ID} and quiz {QUIZ_ID}")
