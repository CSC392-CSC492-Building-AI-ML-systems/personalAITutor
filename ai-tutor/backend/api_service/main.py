from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .models import *
from api_service import db
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
    return os.getenv(f"RAG_SERVICE_{course_code}_URL")

@main.route('/message_history/<course_code>', methods=['GET'])
@jwt_required()
def message_history(course_code):
    user_id = get_jwt_identity()

    # Check if the user is enrolled in the course
    enrollment = db.session.query(user_courses).filter_by(user_id=user_id, course_name=course_code).first()
    if not enrollment:
        return jsonify({"error": "User not enrolled in the course"}), 403

    try:
        # Retrieve all questions and answers for the specific course
        questions_and_answers = db.session.query(Question).filter_by(user_id=user_id, course_name=course_code).order_by(Question.created_at).all()
        message_history = [{"question": qa.question_text, "answer":qa.answer_text} for qa in questions_and_answers]

        return jsonify({"message_history": message_history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@main.route('/ask/<course_code>', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute", key_func=get_jwt_identity)
def ask(course_code):
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400

    user_id = get_jwt_identity()

    # Check if the user is enrolled in the course
    enrollment = db.session.query(user_courses).filter_by(user_id=user_id, course_name=course_code).first()
    if not enrollment:
        return jsonify({"error": "User not enrolled in the course"}), 403

    rag_service_url = get_rag_service_url(course_code)
    if not rag_service_url:
        return jsonify({"error": "Invalid course_name"}), 400

    question_text = data['question']

    try:
        # Retrieve all questions and answers for the specific course
        questions_and_answers = db.session.query(Question).filter_by(user_id=user_id, course_name=course_code).order_by(Question.created_at).all()
        message_history = [{"question": qa.question_text, "answer":qa.answer_text} for qa in questions_and_answers]

        # Call the rag_service API
        response = requests.post(
            f"{rag_service_url}/ask",
            json={"question": question_text, "message_history": message_history}
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to get answer from RAG service"}), response.status_code

        answer_text = response.json().get("answer")

        # Save the question and answer to the database
        question = Question(
            user_id=user_id,
            question_text=question_text,
            answer_text=answer_text,
            course_name=course_code
        )
        db.session.add(question)
        db.session.commit()

        return jsonify({"answer": answer_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500