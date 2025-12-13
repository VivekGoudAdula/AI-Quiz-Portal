from flask import Blueprint, request, jsonify
from flask import g
from flask_login import current_user
from database import db, Quiz, Question, QuestionOption, Answer, Attempt, User, Quiz_Questions, QuizAssignment
from utils.decorators import token_required, role_required, validate_request_json
from datetime import datetime
import random
from sqlalchemy import func
 
quizzes_bp = Blueprint('quizzes', __name__)

@quizzes_bp.route('', methods=['GET'])
@token_required
def list_quizzes():
    """List available quizzes with filters"""
    try:
        user_id = current_user.id
        filter_type = request.args.get('filter', 'all')  # all, active, upcoming, completed
        
        now = datetime.utcnow()
        base_query = Quiz.query
        
        if filter_type == 'active':
            base_query = base_query.filter(Quiz.start_time <= now, Quiz.end_time > now)
        elif filter_type == 'upcoming':
            base_query = base_query.filter(Quiz.start_time > now)
        elif filter_type == 'completed':
            base_query = base_query.filter(Quiz.end_time <= now)
        
        quizzes = base_query.all()
        
        # Get attempt count for each quiz
        quizzes_data = []
        for quiz in quizzes:
            quiz_dict = quiz.to_dict()
            attempt_count = Attempt.query.filter_by(user_id=user_id, quiz_id=quiz.id).count()
            quiz_dict['studentAttempts'] = attempt_count
            if quiz.instructor is not None:
                quiz_dict['instructor'] = quiz.instructor.to_dict()
            else:
                quiz_dict['instructor'] = None
            quizzes_data.append(quiz_dict)
        
        return jsonify({'quizzes': quizzes_data}), 200
    except Exception as e:
        import traceback
        print("[ERROR] Exception in list_quizzes:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('', methods=['POST'])
@token_required
@role_required('instructor', 'admin')
@validate_request_json(['title', 'startTime', 'endTime', 'durationSeconds'])
def create_quiz():
    """Create new quiz (instructor only)"""
    try:
        user_id = current_user.id
        data = request.get_json()
        
        print(f"[DEBUG] Creating quiz with data: {data}")
        
        # Validation
        title = data.get('title', '').strip()
        if not title or len(title) < 3:
            return jsonify({'error': 'Quiz title must be at least 3 characters'}), 400
        
        try:
            start_time = datetime.utcfromtimestamp(data['startTime'] / 1000)
            end_time = datetime.utcfromtimestamp(data['endTime'] / 1000)
            print(f"[DEBUG] Start time: {start_time}, End time: {end_time}")
        except (ValueError, TypeError) as e:
            print(f"[ERROR] Timestamp conversion failed: {e}")
            return jsonify({'error': 'Invalid timestamp format'}), 400
        
        if start_time >= end_time:
            return jsonify({'error': 'Start time must be before end time'}), 400
        
        duration_seconds = data.get('durationSeconds')
        if not isinstance(duration_seconds, int) or duration_seconds <= 0:
            return jsonify({'error': 'Duration must be a positive integer'}), 400
        
        # Create quiz
        new_quiz = Quiz(
            title=title,
            description=data.get('description', ''),
            created_by_id=user_id,
            start_time=start_time,
            end_time=end_time,
            duration_seconds=duration_seconds,
            shuffle_questions=data.get('shuffleQuestions', False),
            shuffle_options=data.get('shuffleOptions', False),
            adaptive=data.get('adaptive', False),
            proctoring_enabled=data.get('proctoringEnabled', False),
            passing_score=data.get('passingScore', 40.0)
        )
        
        db.session.add(new_quiz)
        db.session.commit()
        
        print(f"[SUCCESS] Quiz created: {new_quiz.id}")
        return jsonify({
            'message': 'Quiz created successfully',
            'quiz': new_quiz.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to create quiz: {str(e)}")
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>', methods=['GET'])
@token_required
def get_quiz(quiz_id):
    """Get quiz details"""
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        quiz_dict = quiz.to_dict()
        quiz_dict['instructor'] = quiz.instructor.to_dict()
        
        # Include questions with options
        user_id = current_user.id
        questions = [q.to_dict() for q in quiz.questions]
        
        # Shuffle questions if configured
        if quiz.shuffle_questions:
            random.shuffle(questions)
        
        # Shuffle options in each question
        if quiz.shuffle_options:
            for q in questions:
                if 'options' in q and q['type'] in ['mcq', 'true_false']:
                    random.shuffle(q['options'])
        
        quiz_dict['questions'] = questions
        
        return jsonify({'quiz': quiz_dict}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>', methods=['PUT'])
@token_required
@role_required('instructor', 'admin')
def update_quiz(quiz_id):
    """Update quiz (instructor only)"""
    try:
        user_id = current_user.id
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        if quiz.created_by_id != user_id:
            return jsonify({'error': 'You can only edit your own quizzes'}), 403
        
        data = request.get_json()
        
        if 'title' in data:
            title = data['title'].strip()
            if len(title) < 3:
                return jsonify({'error': 'Quiz title must be at least 3 characters'}), 400
            quiz.title = title
        
        if 'description' in data:
            quiz.description = data['description']
        
        if 'shuffleQuestions' in data:
            quiz.shuffle_questions = data['shuffleQuestions']
        
        if 'shuffleOptions' in data:
            quiz.shuffle_options = data['shuffleOptions']
        
        if 'adaptive' in data:
            quiz.adaptive = data['adaptive']
        
        if 'proctoringEnabled' in data:
            quiz.proctoring_enabled = data['proctoringEnabled']
        
        
        if 'passingScore' in data:
            quiz.passing_score = max(0, data['passingScore'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Quiz updated successfully',
            'quiz': quiz.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>', methods=['DELETE'])
@token_required
@role_required('instructor', 'admin')
def delete_quiz(quiz_id):
    """Delete quiz (instructor only)"""
    try:
        user_id = current_user.id
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        if quiz.created_by_id != user_id:
            return jsonify({'error': 'You can only delete your own quizzes'}), 403
        
        # Check if there are any attempts
        attempt_count = Attempt.query.filter_by(quiz_id=quiz_id).count()
        if attempt_count > 0:
            return jsonify({'error': 'Cannot delete quiz with existing attempts'}), 409
        
        db.session.delete(quiz)
        db.session.commit()
        
        return jsonify({'message': 'Quiz deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>/questions', methods=['POST'])
@token_required
@role_required('instructor', 'admin')
@validate_request_json(['qId'])
def add_question_to_quiz(quiz_id):
    """Add question to quiz"""
    try:
        user_id = current_user.id
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        if quiz.created_by_id != user_id:
            return jsonify({'error': 'You can only edit your own quizzes'}), 403
        
        data = request.get_json()
        question_id = data['qId']
        
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        # Check if question already in quiz
        if question in quiz.questions:
            return jsonify({'error': 'Question already in this quiz'}), 409
        
        # Get max order
        max_order = db.session.query(func.max(Quiz_Questions.order)).filter_by(quiz_id=quiz_id).scalar() or 0
        
        quiz_question = Quiz_Questions(quiz_id=quiz_id, question_id=question_id, order=max_order + 1)
        db.session.add(quiz_question)
        db.session.commit()
        
        return jsonify({
            'message': 'Question added to quiz',
            'quiz': quiz.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>/questions/<question_id>', methods=['DELETE'])
@token_required
@role_required('instructor', 'admin')
def remove_question_from_quiz(quiz_id, question_id):
    """Remove question from quiz"""
    try:
        user_id = current_user.id
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        if quiz.created_by_id != user_id:
            return jsonify({'error': 'You can only edit your own quizzes'}), 403
        
        quiz_question = Quiz_Questions.query.filter_by(quiz_id=quiz_id, question_id=question_id).first()
        if not quiz_question:
            return jsonify({'error': 'Question not in this quiz'}), 404
        
        db.session.delete(quiz_question)
        db.session.commit()
        
        return jsonify({'message': 'Question removed from quiz'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============ AI Question Generation ============

@quizzes_bp.route('/generate/questions', methods=['POST'])
@token_required
@role_required('instructor', 'admin')
@validate_request_json(['topic', 'numQuestions', 'difficulty'])
def generate_ai_questions():
    """Generate AI-based questions for a topic"""
    try:
        user_id = current_user.id
        data = request.get_json()
        
        topic = data.get('topic', '').strip()
        num_questions = data.get('numQuestions', 5)
        difficulty = data.get('difficulty', 'medium')  # easy, medium, hard
        
        if not topic or len(topic) < 3:
            return jsonify({'error': 'Topic must be at least 3 characters'}), 400
        
        if num_questions < 1 or num_questions > 50:
            return jsonify({'error': 'Number of questions must be between 1 and 50'}), 400
        
        if difficulty not in ['easy', 'medium', 'hard']:
            return jsonify({'error': 'Difficulty must be easy, medium, or hard'}), 400
        
        # Question templates by topic category for variety
        question_templates = _get_question_templates(topic, difficulty, num_questions)
        
        generated_questions = []
        
        for i, q_data in enumerate(question_templates):
            new_question = Question(
                text=q_data['question'],
                type='mcq',
                difficulty=difficulty,
                created_by_id=user_id
            )
            db.session.add(new_question)
            db.session.flush()
            
            # Randomize which option is correct (0-3)
            correct_idx = random.randint(0, 3)
            option_letters = ['A', 'B', 'C', 'D']
            
            for idx, letter in enumerate(option_letters):
                option = QuestionOption(
                    question_id=new_question.id,
                    text=q_data['options'][letter],
                    is_correct=(idx == correct_idx)
                )
                db.session.add(option)
            
            # Store correct answer letter for response
            q_dict = new_question.to_dict()
            q_dict['correctAnswer'] = option_letters[correct_idx]
            generated_questions.append(q_dict)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Generated {num_questions} questions successfully',
            'questions': generated_questions,
            'count': len(generated_questions)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def _get_question_templates(topic: str, difficulty: str, count: int) -> list:
    """Generate unique question templates based on topic and difficulty"""
    import hashlib
    import time
    
    # Create unique seed for this generation
    seed = hashlib.md5(f"{topic}{difficulty}{time.time()}{random.random()}".encode()).hexdigest()
    random.seed(seed)
    
    topic_lower = topic.lower()
    questions = []
    
    # Programming/Tech topics
    if any(kw in topic_lower for kw in ['python', 'programming', 'code', 'coding']):
        questions = _generate_programming_questions(topic, difficulty, count)
    elif any(kw in topic_lower for kw in ['react', 'javascript', 'frontend', 'web', 'html', 'css']):
        questions = _generate_frontend_questions(topic, difficulty, count)
    elif any(kw in topic_lower for kw in ['database', 'sql', 'mysql', 'mongodb']):
        questions = _generate_database_questions(topic, difficulty, count)
    elif any(kw in topic_lower for kw in ['machine learning', 'ml', 'ai', 'deep learning', 'neural']):
        questions = _generate_ml_questions(topic, difficulty, count)
    elif any(kw in topic_lower for kw in ['network', 'security', 'cyber', 'protocol']):
        questions = _generate_network_questions(topic, difficulty, count)
    else:
        questions = _generate_general_questions(topic, difficulty, count)
    
    # Reset random seed
    random.seed()
    
    return questions[:count]


def _generate_programming_questions(topic: str, difficulty: str, count: int) -> list:
    """Generate programming-related questions"""
    templates = [
        {
            "question": f"What is the correct way to define a function in {topic}?",
            "options": {"A": "def function_name():", "B": "function function_name():", "C": "fn function_name():", "D": "define function_name():"}
        },
        {
            "question": f"Which data type is used to store a sequence of characters in {topic}?",
            "options": {"A": "int", "B": "float", "C": "str", "D": "bool"}
        },
        {
            "question": f"What is the output of print(type([])) in {topic}?",
            "options": {"A": "<class 'list'>", "B": "<class 'array'>", "C": "<class 'tuple'>", "D": "<class 'dict'>"}
        },
        {
            "question": f"Which keyword is used to handle exceptions in {topic}?",
            "options": {"A": "try-except", "B": "catch-throw", "C": "handle-error", "D": "if-else"}
        },
        {
            "question": f"What is the purpose of __init__ method in {topic} classes?",
            "options": {"A": "Constructor method", "B": "Destructor method", "C": "Static method", "D": "Class method"}
        },
        {
            "question": f"Which operator is used for exponentiation in {topic}?",
            "options": {"A": "**", "B": "^", "C": "^^", "D": "exp()"}
        },
        {
            "question": f"What does the 'self' keyword represent in {topic}?",
            "options": {"A": "Current instance of the class", "B": "Parent class", "C": "Global variable", "D": "Module name"}
        },
        {
            "question": f"Which method is used to add an element to a list in {topic}?",
            "options": {"A": "append()", "B": "add()", "C": "insert_end()", "D": "push()"}
        },
        {
            "question": f"What is a lambda function in {topic}?",
            "options": {"A": "Anonymous function", "B": "Recursive function", "C": "Generator function", "D": "Async function"}
        },
        {
            "question": f"Which statement is used to exit a loop prematurely in {topic}?",
            "options": {"A": "break", "B": "exit", "C": "stop", "D": "end"}
        },
    ]
    random.shuffle(templates)
    return templates


def _generate_frontend_questions(topic: str, difficulty: str, count: int) -> list:
    """Generate frontend development questions"""
    templates = [
        {
            "question": "What hook is used for side effects in React?",
            "options": {"A": "useEffect", "B": "useState", "C": "useContext", "D": "useReducer"}
        },
        {
            "question": "Which CSS property is used to make a flex container?",
            "options": {"A": "display: flex", "B": "position: flex", "C": "layout: flex", "D": "flex: true"}
        },
        {
            "question": "What is the virtual DOM in React?",
            "options": {"A": "Lightweight copy of the real DOM", "B": "Browser extension", "C": "Server-side rendering", "D": "CSS framework"}
        },
        {
            "question": "Which HTML tag is used for the largest heading?",
            "options": {"A": "<h1>", "B": "<heading>", "C": "<head>", "D": "<h6>"}
        },
        {
            "question": "What does JSX stand for?",
            "options": {"A": "JavaScript XML", "B": "Java Syntax Extension", "C": "JSON XML", "D": "JavaScript Extension"}
        },
        {
            "question": "Which method is used to update state in React functional components?",
            "options": {"A": "useState setter function", "B": "this.setState()", "C": "updateState()", "D": "changeState()"}
        },
        {
            "question": "What is the purpose of the 'key' prop in React lists?",
            "options": {"A": "Unique identifier for list items", "B": "Styling attribute", "C": "Event handler", "D": "Data binding"}
        },
        {
            "question": "Which CSS unit is relative to the font-size of the root element?",
            "options": {"A": "rem", "B": "em", "C": "px", "D": "vh"}
        },
        {
            "question": "What is the correct way to conditionally render in React?",
            "options": {"A": "{condition && <Component />}", "B": "if(condition) <Component />", "C": "<if condition><Component /></if>", "D": "render(condition, Component)"}
        },
        {
            "question": "Which event is triggered when a user clicks a button?",
            "options": {"A": "onClick", "B": "onPress", "C": "onTap", "D": "onSelect"}
        },
    ]
    random.shuffle(templates)
    return templates


def _generate_database_questions(topic: str, difficulty: str, count: int) -> list:
    """Generate database-related questions"""
    templates = [
        {
            "question": "Which SQL command is used to retrieve data from a database?",
            "options": {"A": "SELECT", "B": "GET", "C": "FETCH", "D": "RETRIEVE"}
        },
        {
            "question": "What does ACID stand for in database transactions?",
            "options": {"A": "Atomicity, Consistency, Isolation, Durability", "B": "Access, Control, Identity, Data", "C": "Automatic, Concurrent, Isolated, Durable", "D": "Active, Consistent, Indexed, Dynamic"}
        },
        {
            "question": "Which SQL clause is used to filter records?",
            "options": {"A": "WHERE", "B": "FILTER", "C": "HAVING", "D": "LIMIT"}
        },
        {
            "question": "What is a primary key in a database?",
            "options": {"A": "Unique identifier for each record", "B": "First column in a table", "C": "Foreign reference", "D": "Index name"}
        },
        {
            "question": "Which SQL command is used to add new records?",
            "options": {"A": "INSERT INTO", "B": "ADD RECORD", "C": "CREATE ROW", "D": "APPEND"}
        },
        {
            "question": "What is normalization in databases?",
            "options": {"A": "Organizing data to reduce redundancy", "B": "Backing up data", "C": "Encrypting data", "D": "Compressing data"}
        },
        {
            "question": "Which join returns all records from both tables?",
            "options": {"A": "FULL OUTER JOIN", "B": "INNER JOIN", "C": "LEFT JOIN", "D": "CROSS JOIN"}
        },
        {
            "question": "What is an index in a database?",
            "options": {"A": "Data structure to speed up queries", "B": "Primary key", "C": "Table name", "D": "Column type"}
        },
    ]
    random.shuffle(templates)
    return templates


def _generate_ml_questions(topic: str, difficulty: str, count: int) -> list:
    """Generate machine learning questions"""
    templates = [
        {
            "question": "What is supervised learning?",
            "options": {"A": "Learning with labeled data", "B": "Learning without labels", "C": "Reinforcement-based learning", "D": "Transfer learning"}
        },
        {
            "question": "Which algorithm is used for classification?",
            "options": {"A": "Logistic Regression", "B": "Linear Regression", "C": "K-Means", "D": "PCA"}
        },
        {
            "question": "What is overfitting in machine learning?",
            "options": {"A": "Model performs well on training but poorly on test data", "B": "Model performs poorly on all data", "C": "Model is too simple", "D": "Model has too few parameters"}
        },
        {
            "question": "Which technique is used to prevent overfitting?",
            "options": {"A": "Regularization", "B": "More training data only", "C": "Increasing model complexity", "D": "Removing validation set"}
        },
        {
            "question": "What is a neural network activation function?",
            "options": {"A": "Function that introduces non-linearity", "B": "Loss function", "C": "Optimizer", "D": "Learning rate"}
        },
        {
            "question": "What does CNN stand for in deep learning?",
            "options": {"A": "Convolutional Neural Network", "B": "Connected Neural Network", "C": "Circular Neural Network", "D": "Computed Neural Network"}
        },
        {
            "question": "Which metric is used for regression problems?",
            "options": {"A": "Mean Squared Error", "B": "Accuracy", "C": "F1 Score", "D": "Precision"}
        },
        {
            "question": "What is the purpose of the training set?",
            "options": {"A": "To train the model", "B": "To test final performance", "C": "To tune hyperparameters", "D": "To deploy the model"}
        },
    ]
    random.shuffle(templates)
    return templates


def _generate_network_questions(topic: str, difficulty: str, count: int) -> list:
    """Generate networking/security questions"""
    templates = [
        {
            "question": "What does HTTP stand for?",
            "options": {"A": "HyperText Transfer Protocol", "B": "High Transfer Text Protocol", "C": "Hyper Transfer Text Protocol", "D": "Home Text Transfer Protocol"}
        },
        {
            "question": "Which port does HTTPS use by default?",
            "options": {"A": "443", "B": "80", "C": "8080", "D": "22"}
        },
        {
            "question": "What is the purpose of a firewall?",
            "options": {"A": "Filter network traffic", "B": "Speed up internet", "C": "Store data", "D": "Compress files"}
        },
        {
            "question": "What does DNS stand for?",
            "options": {"A": "Domain Name System", "B": "Data Network Service", "C": "Digital Name Server", "D": "Dynamic Network System"}
        },
        {
            "question": "Which protocol is used for secure file transfer?",
            "options": {"A": "SFTP", "B": "FTP", "C": "HTTP", "D": "SMTP"}
        },
        {
            "question": "What is an IP address?",
            "options": {"A": "Unique identifier for a device on a network", "B": "Website name", "C": "Email address", "D": "Password"}
        },
        {
            "question": "What is encryption?",
            "options": {"A": "Converting data into a coded format", "B": "Compressing data", "C": "Deleting data", "D": "Copying data"}
        },
        {
            "question": "Which layer of OSI model handles routing?",
            "options": {"A": "Network Layer", "B": "Transport Layer", "C": "Data Link Layer", "D": "Application Layer"}
        },
    ]
    random.shuffle(templates)
    return templates


def _generate_general_questions(topic: str, difficulty: str, count: int) -> list:
    """Generate general topic questions"""
    import uuid
    
    question_starters = [
        f"What is the primary purpose of {topic}?",
        f"Which of the following best describes {topic}?",
        f"What is a key characteristic of {topic}?",
        f"How does {topic} differ from traditional approaches?",
        f"What is the main advantage of using {topic}?",
        f"Which component is essential in {topic}?",
        f"What problem does {topic} primarily solve?",
        f"In {topic}, what is considered a best practice?",
        f"What is the fundamental concept behind {topic}?",
        f"Which statement about {topic} is correct?",
    ]
    
    templates = []
    for i, question in enumerate(question_starters[:count]):
        unique_id = str(uuid.uuid4())[:4]
        templates.append({
            "question": question,
            "options": {
                "A": f"Core functionality and implementation of {topic}",
                "B": f"Secondary feature related to {topic}",
                "C": f"Alternative approach to {topic}",
                "D": f"Unrelated concept to {topic}"
            }
        })
    
    random.shuffle(templates)
    return templates


@quizzes_bp.route('/<quiz_id>/assign', methods=['POST'])
@token_required
@role_required('instructor', 'admin')
@validate_request_json(['studentIds', 'dueDate'])
def assign_quiz_to_students(quiz_id):
    """Assign quiz to students"""
    try:
        user_id = current_user.id
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        if quiz.created_by_id != user_id:
            return jsonify({'error': 'You can only assign your own quizzes'}), 403
        data = request.get_json()
        student_ids = data.get('studentIds', [])
        due_date_str = data.get('dueDate')
        if not student_ids or not isinstance(student_ids, list):
            return jsonify({'error': 'studentIds must be a non-empty list'}), 400
        try:
            due_date = datetime.fromisoformat(due_date_str) if due_date_str else None
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid due date format'}), 400

        # --- Ensure quiz start_time is now or earlier ---
        now = datetime.utcnow()
        if quiz.start_time > now:
            quiz.start_time = now
            db.session.add(quiz)

        assigned_count = 0
        for student_id in student_ids:
            student = User.query.get(student_id)
            if not student or student.role != 'student':
                continue
            # Prevent duplicate assignments
            existing = QuizAssignment.query.filter_by(quiz_id=quiz_id, student_id=student_id).first()
            if existing:
                continue
            assignment = QuizAssignment(
                quiz_id=quiz_id,
                student_id=student_id,
                assigned_by_id=user_id,
                assigned_at=datetime.utcnow(),
                due_date=due_date
            )
            db.session.add(assignment)
            assigned_count += 1
        db.session.commit()
        return jsonify({
            'message': f'Quiz assigned to {assigned_count} students',
            'assignedCount': assigned_count,
            'quiz': quiz.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@quizzes_bp.route('/student/assigned', methods=['GET'])
@token_required
def get_assigned_quizzes():
    """Get quizzes assigned to the current student"""
    try:
        user_id = current_user.id
        user = User.query.get(user_id)
        if not user or user.role != 'student':
            return jsonify({'error': 'Only students can view assigned quizzes'}), 403
        # Get all quizzes assigned to this student
        assignments = QuizAssignment.query.filter_by(student_id=user_id).all()
        quizzes_data = []
        for assignment in assignments:
            quiz = assignment.quiz
            quiz_dict = quiz.to_dict()
            quiz_dict['dueDate'] = assignment.due_date.isoformat() if assignment.due_date else None
            # Get the latest submitted attempt for this quiz by this user
            attempt = Attempt.query.filter_by(user_id=user_id, quiz_id=quiz.id, is_submitted=True).order_by(Attempt.start_time.desc()).first()
            quiz_dict['attempted'] = attempt is not None
            quiz_dict['score'] = attempt.final_score if attempt else None
            quiz_dict['attemptId'] = attempt.id if attempt else None
            quiz_dict['instructor'] = quiz.instructor.to_dict()
            quizzes_data.append(quiz_dict)
        return jsonify({'quizzes': quizzes_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

