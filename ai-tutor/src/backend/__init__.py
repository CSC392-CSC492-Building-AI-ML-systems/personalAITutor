from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from neo4j import GraphDatabase
from neo4j_graphrag.retrievers import VectorRetriever, HybridRetriever, Text2CypherRetriever
from neo4j_graphrag.llm import OpenAILLM
from neo4j_graphrag.generation import GraphRAG
from langchain_huggingface import HuggingFaceEmbeddings
import os
import dotenv

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('backend.config.Config')

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

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

    with app.app_context():
        from .main import main as main_blueprint
        from .auth import auth as auth_blueprint

        app.register_blueprint(main_blueprint)
        app.register_blueprint(auth_blueprint, url_prefix='/auth')

        db.create_all()

    return app