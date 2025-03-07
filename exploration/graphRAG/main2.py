import os
import openai
from llama_index.vector_stores.neo4jvector import Neo4jVectorStore
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.embeddings.openai import OpenAIEmbedding

# Set up paths for storage
PERSIST_DIR = "./storage"  # Folder to store the index

# Set Neo4j credentials
url = "neo4j+s://9a5c6af1.databases.neo4j.io"
username = "neo4j"
password = "LImqHXRqouoA7sJXBsDaXK9WlmPT25up2E8rrcCopLY"

# Check if the index is already stored
if os.path.exists(PERSIST_DIR):
    print("Loading existing index from storage...")
    storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
    index = load_index_from_storage(storage_context)
else:
    print("Creating new index and storing it...")

    # Set OpenAI API key (only needed once)
    os.environ["OPENAI_API_KEY"] = "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"
    openai.api_key = os.environ["OPENAI_API_KEY"]

    # Set up embedding model
    embed_model = OpenAIEmbedding(
        model_name="text-embedding-3-small",
        dimensions=384,
        api_key=os.environ["OPENAI_API_KEY"]
    )

    # Initialize Neo4j vector store
    neo4j_vector = Neo4jVectorStore(
        username=username,
        password=password,
        url=url,
        embedding_dimension=384
    )

    # Create and persist storage context
    storage_context = StorageContext.from_defaults(vector_store=neo4j_vector)
    index = VectorStoreIndex.from_vector_store(
        vector_store=neo4j_vector,
        embed_model=embed_model
    )
    
    # Save the index for future use
    index.storage_context.persist(persist_dir=PERSIST_DIR)

# Create a query engine from the stored index
query_engine = index.as_query_engine(
    similarity_top_k=5,
    similarity_threshold=0.5
)

# Execute query
response = query_engine.query(
    "1) What is Inheritence?"
    "2) What is object oriented programming?"
)

print("Query Response:")
print(response)
