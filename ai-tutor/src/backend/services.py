from neo4j import GraphDatabase
from neo4j_graphrag.retrievers import VectorRetriever, HybridRetriever, Text2CypherRetriever
from neo4j_graphrag.llm import OpenAILLM
from neo4j_graphrag.generation import GraphRAG
from langchain_huggingface import HuggingFaceEmbeddings
import os
import dotenv

# Load environment variables
dotenv.load_dotenv("env.txt")

# Neo4j connection details
URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

# Initialize the Neo4j driver
driver = GraphDatabase.driver(URI, auth=AUTH)

# Initialize the LLM
llm = OpenAILLM(model_name="gpt-4o", model_params={"temperature": 0})

# Set up the embedder
embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Index names
INDEX_NAME = "vector"
FULLTEXT_INDEX_NAME = "keyword"

# Initialize the retrievers
vector_retriever = VectorRetriever(driver, INDEX_NAME, embedder)
hybrid_retriever = HybridRetriever(driver, INDEX_NAME, FULLTEXT_INDEX_NAME, embedder)
text2cypher_retriever = Text2CypherRetriever(driver, llm)

# Initialize the GraphRAG pipeline
rag = GraphRAG(llm=llm, retriever=vector_retriever)
