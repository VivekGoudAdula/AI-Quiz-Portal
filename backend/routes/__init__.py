
from flask import Blueprint
from .generate_questions import generate_questions_bp

quizzes_bp = Blueprint('quizzes', __name__)
attempts_bp = Blueprint('attempts', __name__)
proctoring_bp = Blueprint('proctoring', __name__)
instructor_bp = Blueprint('instructor', __name__)
admin_bp = Blueprint('admin', __name__)
# Expose generate_questions_bp for import convenience
