from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from services import rag, vector_retriever, hybrid_retriever, text2cypher_retriever
from models import Question
from __init__ import db

main = Blueprint('main', __name__)

# Initialize Flask-Limiter
limiter = Limiter(
    get_remote_address,
    default_limits=["5 per minute"],
    storage_uri="sqlalchemy:///backend/database.db"
)

@main.route('/ask', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute", key_func=get_jwt_identity)
def ask():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400

    question_text = data['question']
    retriever_type = data['retriever_type']
    user_id = get_jwt_identity()

    # Select the appropriate retriever based on the retriever_type
    if retriever_type == 'VectorRetriever':
        rag.retriever = vector_retriever
        retriever_config = {"top_k": 5}
    elif retriever_type == 'HybridRetriever':
        rag.retriever = hybrid_retriever
        retriever_config = {"top_k": 5}
    elif retriever_type == 'Text2CypherRetriever':
        rag.retriever = text2cypher_retriever
        retriever_config = None
    else:
        return jsonify({"error": "Invalid retriever type specified"}), 400

    try:
        # Run the query through the GraphRAG pipeline
        response = rag.search(query_text=question_text, retriever_config=retriever_config)
        answer_text = response.answer

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
def get_flowchart():
    try:
        with open('flowchart.txt', 'r') as file:
            content = file.read()
        return content
    except Exception as e:
        return str(e), 500