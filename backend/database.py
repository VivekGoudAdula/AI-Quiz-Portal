from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='student')  # student, instructor, admin
    photo_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quizzes = db.relationship('Quiz', backref='instructor', lazy=True, foreign_keys='Quiz.created_by_id')
    attempts = db.relationship('Attempt', backref='student', lazy=True)
    proctor_events = db.relationship('ProctoringEvent', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'photoURL': self.photo_url,
            'createdAt': int(self.created_at.timestamp() * 1000)
        }


class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    shuffle_questions = db.Column(db.Boolean, default=False)
    shuffle_options = db.Column(db.Boolean, default=False)
    adaptive = db.Column(db.Boolean, default=False)
    proctoring_enabled = db.Column(db.Boolean, default=False)
    max_attempts = db.Column(db.Integer, default=1)
    passing_score = db.Column(db.Float, default=40.0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    questions = db.relationship('Question', secondary='quiz_questions', backref='quizzes', lazy=True)
    attempts = db.relationship('Attempt', backref='quiz', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'quizId': self.id,
            'title': self.title,
            'description': self.description,
            'createdBy': self.created_by_id,
            'startTime': int(self.start_time.timestamp() * 1000),
            'endTime': int(self.end_time.timestamp() * 1000),
            'durationSeconds': self.duration_seconds,
            'shuffleQuestions': self.shuffle_questions,
            'shuffleOptions': self.shuffle_options,
            'adaptive': self.adaptive,
            'proctoringEnabled': self.proctoring_enabled,
            'maxAttempts': self.max_attempts,
            'passingScore': self.passing_score,
            'questionIds': [q.id for q in self.questions]
        }


class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # mcq, true_false, short_answer, long_answer
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    marks = db.Column(db.Float, default=1.0)
    tags = db.Column(db.JSON, default=[])  # List of tags
    explanation = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    options = db.relationship('QuestionOption', backref='question', lazy=True, cascade='all, delete-orphan')
    answers = db.relationship('Answer', backref='question', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', backref='created_questions')
    
    def to_dict(self):
        return {
            'qId': self.id,
            'text': self.text,
            'type': self.type,
            'difficulty': self.difficulty,
            'marks': self.marks,
            'tags': self.tags,
            'explanation': self.explanation,
            'options': [opt.to_dict() for opt in self.options]
        }


class QuestionOption(db.Model):
    __tablename__ = 'question_options'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = db.Column(db.String(36), db.ForeignKey('questions.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'isCorrect': self.is_correct
        }


class Quiz_Questions(db.Model):
    __tablename__ = 'quiz_questions'
    
    quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), primary_key=True)
    question_id = db.Column(db.String(36), db.ForeignKey('questions.id'), primary_key=True)
    order = db.Column(db.Integer, default=0)


class Attempt(db.Model):
    __tablename__ = 'attempts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    final_score = db.Column(db.Float, nullable=True)
    total_marks = db.Column(db.Float, default=0.0)
    warnings = db.Column(db.Integer, default=0)
    suspicion_score = db.Column(db.Float, default=0.0)
    is_submitted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    answers = db.relationship('Answer', backref='attempt', lazy=True, cascade='all, delete-orphan')
    proctor_events = db.relationship('ProctoringEvent', backref='attempt', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'attemptId': self.id,
            'userId': self.user_id,
            'quizId': self.quiz_id,
            'startTime': int(self.start_time.timestamp() * 1000),
            'endTime': int(self.end_time.timestamp() * 1000) if self.end_time else None,
            'finalScore': self.final_score,
            'totalMarks': self.total_marks,
            'warnings': self.warnings,
            'suspicionScore': self.suspicion_score,
            'isSubmitted': self.is_submitted
        }


class Answer(db.Model):
    __tablename__ = 'answers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = db.Column(db.String(36), db.ForeignKey('attempts.id'), nullable=False)
    question_id = db.Column(db.String(36), db.ForeignKey('questions.id'), nullable=False)
    user_answer = db.Column(db.Text, nullable=True)  # For text answers or option IDs
    is_correct = db.Column(db.Boolean, nullable=True)
    score_obtained = db.Column(db.Float, default=0.0)
    time_spent_seconds = db.Column(db.Integer, default=0)
    is_marked_for_review = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'answerId': self.id,
            'qId': self.question_id,
            'answer': self.user_answer,
            'isCorrect': self.is_correct,
            'scoreObtained': self.score_obtained,
            'timeSpent': self.time_spent_seconds,
            'markedForReview': self.is_marked_for_review
        }


class ProctoringEvent(db.Model):
    __tablename__ = 'proctor_events'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = db.Column(db.String(36), db.ForeignKey('attempts.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    event_type = db.Column(db.String(100), nullable=False)  # tab-switch, fullscreen-exit, face-lost, etc
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    meta = db.Column(db.JSON, nullable=True)  # Additional metadata
    severity = db.Column(db.String(20), default='warning')  # info, warning, critical
    
    def to_dict(self):
        return {
            'eventId': self.id,
            'attemptId': self.attempt_id,
            'userId': self.user_id,
            'type': self.event_type,
            'timestamp': int(self.timestamp.timestamp() * 1000),
            'meta': self.meta,
            'severity': self.severity
        }
