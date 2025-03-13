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

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL")

@main.route('/ask', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute", key_func=get_jwt_identity)
def ask():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400

    question_text = data['question']
    user_id = get_jwt_identity()

    try:
        # Call the rag_service API
        response = requests.post(
            f"{RAG_SERVICE_URL}/ask",
            json={"question": question_text}
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to get answer from RAG service"}), response.status_code

        answer_text = response.json().get("answer")

        # Save the question and answer to the database
        question = Question(
            user_id=user_id,
            question_text=question_text,
            answer_text=answer_text
        )
        db.session.add(question)
        db.session.commit()

        return jsonify({"answer": answer_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/get-flowchart', methods=['GET'])
@jwt_required()
def get_flowchart():
    try:
        with open('flowchart.txt', 'r') as file:
            content = file.read()
        return content
    except Exception as e:
        return str(e), 500