from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from models import *
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

    course_name = request.args.get('course_name')
    if not course_name:
        return jsonify({"error": "No course_name provided"}), 400

    user_id = get_jwt_identity()

    # Check if the user is enrolled in the course
    enrollment = user_courses.query.filter_by(user_id=user_id, course_name=course_name).first()
    if not enrollment:
        return jsonify({"error": "User not enrolled in the course"}), 403

    rag_service_url = get_rag_service_url(course_name)
    if not rag_service_url:
        return jsonify({"error": "Invalid course_name"}), 400

    question_text = data['question']

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
            course_name=course_name
        )
        db.session.add(question)
        db.session.commit()

        return jsonify({"answer": answer_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500