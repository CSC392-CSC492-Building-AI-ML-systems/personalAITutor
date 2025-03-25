from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from neo4j import GraphDatabase
from neo4j_graphrag.retrievers import HybridRetriever
from neo4j_graphrag.llm import OpenAILLM
from neo4j_graphrag.generation import GraphRAG
from neo4j_graphrag.types import LLMMessage
from neo4j_graphrag.embeddings.base import Embedder
from sentence_transformers import SentenceTransformer
import os

app = FastAPI()

# Neo4j connection details
URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

# Initialize the Neo4j driver
driver = GraphDatabase.driver(URI, auth=AUTH)

# Initialize the LLM
llm = OpenAILLM(model_name="gpt-4o", model_params={"temperature": 0})

# Define a custom embedder class
class CustomEmbedder(Embedder):
    def __init__(self, model_name):
        self.model = SentenceTransformer(model_name)

    def embed_query(self, text):
        texts = list(map(lambda x: x.replace("\n", " "), [text]))
        embeddings = self.model.encode(
            texts
        )
        if isinstance(embeddings, list):
            raise TypeError(
                "Expected embeddings to be a Tensor or a numpy array, "
                "got a list instead."
            )
        return embeddings.tolist()[0]

# Set up the embedder
embedder = CustomEmbedder('sentence-transformers/all-MiniLM-L6-v2')

# embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Index names
INDEX_NAME = "vector"
FULLTEXT_INDEX_NAME = "keyword"

fields = [
    "fileName",
    "text",
    "score"
]

# Initialize the retrievers
# vector_retriever = VectorRetriever(driver, INDEX_NAME, embedder)
hybrid_retriever = HybridRetriever(
    driver,
    vector_index_name=INDEX_NAME,
    fulltext_index_name=FULLTEXT_INDEX_NAME,
    embedder=embedder,
    return_properties=fields
)
# text2cypher_retriever = Text2CypherRetriever(driver, llm)

# Initialize the GraphRAG pipeline
rag = GraphRAG(llm=llm, retriever=hybrid_retriever)

class QuestionRequest(BaseModel):
    question: str
    message_history: list


@app.post("/ask")
async def ask(request: QuestionRequest):
    question_text = request.question
    history = request.message_history

    # Sanitize the input query
    sanitized_question_text = question_text

    message_history = []
    for qa in history:
        message_history.append(LLMMessage(role="user", content=qa["question"]))
        message_history.append(LLMMessage(role="assistant", content=qa["answer"]))

    retriever_config = {"top_k": 5}
    try:
        response = rag.search(query_text=question_text, retriever_config=retriever_config, return_context=True)
        answer_text = response.answer

        # Extract sources and documents
        results = response.retriever_result.items
        output = []

        for item in results:
            content_dict = eval(item.content)
            source = content_dict.get('fileName', 'Unknown')
            chunk = content_dict.get('text', '')
            score = item.metadata.get('score', None)

            output.append({
                'source': source,
                'chunk': chunk,
                'score': score
            })

        return {
            "answer": answer_text,
            "sources": output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)