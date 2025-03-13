from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from models import Question
from __init__ import db
import os
import requests

main = Blueprint('main', __name__)

# Initialize Flask-Limiter
limiter = Limiter(
    get_remote_address,
    default_limits=["5 per minute"],
    storage_uri="sqlalchemy:///backend/database.db"
)

def get_rag_service_url(course_code):
    return os.getenv(f"RAG_SERVICE_COURSE_{course_code}_URL")

@main.route('/ask', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute", key_func=get_jwt_identity)
def ask():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400

    course_id = request.args.get('course_id')
    if not course_id:
        return jsonify({"error": "No course_id provided"}), 400

    rag_service_url = get_rag_service_url(course_id)
    if not rag_service_url:
        return jsonify({"error": "Invalid course_id"}), 400

    question_text = data['question']
    user_id = get_jwt_identity()

    try:
        # Call the rag_service API
        response = requests.post(
            f"{rag_service_url}/ask",
            json={"question": question_text}
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to get answer from RAG service"}), response.status_code

        answer_text = response.json().get("answer")

        # Save the question and answer to the database
        question = Question(
            user_id=user_id,
            question_text=question_text,
            answer_text=answer_text,
            course_id=course_id
        )
        db.session.add(question)
        db.session.commit()

        return jsonify({"answer": answer_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/get-flowchart/<course_code>', methods=['GET'])
@jwt_required()
def get_flowchart(course_code):
    file_path = f'assets/{course_code}_flowchart.txt'
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        return content
    except FileNotFoundError:
        return jsonify({"error": "Flowchart not found"}), 404
    except Exception as e:
        return str(e), 500