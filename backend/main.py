import os
import dotenv
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from neo4j import GraphDatabase
from neo4j_graphrag.retrievers import VectorRetriever
from neo4j_graphrag.llm import OpenAILLM
from neo4j_graphrag.generation import GraphRAG
from langchain_huggingface import HuggingFaceEmbeddings

app = Flask(__name__)

# Initialize Flask-Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["5 per minute"]
)

# Set up environment variables and Neo4j connection info
load_status = dotenv.load_dotenv("env.txt")
if not load_status:
    raise RuntimeError('Environment variables not loaded.')

URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
INDEX_NAME = "vector"

# Initialize the Neo4j driver
driver = GraphDatabase.driver(URI, auth=AUTH)

# Set up the embedder using HuggingFace
embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize the retriever with the embedder
retriever = VectorRetriever(driver, INDEX_NAME, embedder)

# Initialize the LLM (using OpenAI in this case)
llm = OpenAILLM(model_name="gpt-4o", model_params={"temperature": 0})

# Create the GraphRAG pipeline with the retriever and LLM
rag = GraphRAG(retriever=retriever, llm=llm)

@app.route('/ask', methods=['POST'])
@limiter.limit("5 per minute")
def ask():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400
    question = data['question']
    try:
        # Run the query through the GraphRAG pipeline
        response = rag.search(query_text=question, retriever_config={"top_k": 5})
        answer = response.answer
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
