from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .models import *
from api_service import db
import os
import requests
import re
from html import escape

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
    enrollment = db.session.query(user_courses).filter_by(user_id=user_id, course_code=course_code).first()
    if not enrollment:
        return jsonify({"error": "User not enrolled in the course"}), 403

    try:
        # Retrieve all questions and answers for the specific course
        questions_and_answers = db.session.query(Question).filter_by(user_id=user_id, course_code=course_code).order_by(Question.created_at).all()

        if not questions_and_answers:
            return jsonify({"message": "No message history found for this course"}), 200

        message_history = [{"question": qa.question_text, "answer":qa.answer_text} for qa in questions_and_answers]

        return jsonify({"message_history": message_history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Custom rate limit exceeded handler
@limiter.request_filter
def rate_limit_exceeded():
    return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429

def sanitize_input(text: str) -> str:
    # Remove potentially harmful HTML tags and attributes
    sanitized_text = escape(text)
    # Further remove any non-alphanumeric characters, except spaces
    sanitized_text = re.sub(r'[^\w\s]', '', sanitized_text)
    return sanitized_text.strip()


@main.route('/ask/<course_code>', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute", key_func=get_jwt_identity)
def ask(course_code):
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400

    user_id = get_jwt_identity()

    # Check if the user is enrolled in the course
    enrollment = db.session.query(user_courses).filter_by(user_id=user_id, course_code=course_code).first()
    if not enrollment:
        return jsonify({"error": "User not enrolled in the course"}), 403

    rag_service_url = get_rag_service_url(course_code)
    if not rag_service_url:
        return jsonify({"error": "Invalid course_code"}), 400

    question_text = data['question']

    try:
        # Retrieve all questions and answers for the specific course
        questions_and_answers = db.session.query(Question).filter_by(user_id=user_id, course_code=course_code).order_by(Question.created_at).all()
        message_history = [{"question": sanitize_input(qa.question_text), "answer":sanitize_input(qa.answer_text)} for qa in questions_and_answers]

        # Call the rag_service API
        response = requests.post(
            f"{rag_service_url}/ask",
            json={"question": sanitize_input(question_text), "message_history": message_history}
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to get answer from RAG service"}), response.status_code

        answer_text = response.json().get("answer")
        sources = response.json().get("sources")

        # Save the question and answer to the database
        question = Question(
            user_id=user_id,
            question_text=question_text,
            answer_text=answer_text,
            course_code=course_code
        )
        db.session.add(question)
        db.session.commit()

        return jsonify({"answer": answer_text, "sources": sources})
    except Exception as e:
        return jsonify({"error": str(e)}), 500