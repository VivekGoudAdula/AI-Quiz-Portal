import os
from flask import Blueprint, request, jsonify
import google.generativeai as genai

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

generate_questions_bp = Blueprint('generate_questions', __name__)

@generate_questions_bp.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt or not prompt.strip():
        return jsonify({"error": "Prompt (topic) is required."}), 400
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return jsonify({"question": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
