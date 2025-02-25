import os
import dotenv
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from neo4j import GraphDatabase
from neo4j_graphrag.retrievers import VectorRetriever, HybridRetriever, Text2CypherRetriever
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
FULLTEXT_INDEX_NAME = "keyword"

# Initialize the Neo4j driver
driver = GraphDatabase.driver(URI, auth=AUTH)

# Initialize the LLM (using OpenAI in this case)
llm = OpenAILLM(model_name="gpt-4o", model_params={"temperature": 0})

# Set up the embedder using HuggingFace
embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize the retrievers with the embedder
vector_retriever = VectorRetriever(driver, INDEX_NAME, embedder)
hybrid_retriever = HybridRetriever(driver, INDEX_NAME, FULLTEXT_INDEX_NAME, embedder)
text2cypher_retriever = Text2CypherRetriever(driver, llm)

# Create the GraphRAG pipeline with the LLM and a temporary retriever
rag = GraphRAG(llm=llm, retriever=vector_retriever)

@app.route('/ask', methods=['POST'])
@limiter.limit("5 per minute")
def ask():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400

    question = data['question']
    retriever_type = data['retriever_type']

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
        response = rag.search(query_text=question, retriever_config=retriever_config)
        answer = response.answer
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
