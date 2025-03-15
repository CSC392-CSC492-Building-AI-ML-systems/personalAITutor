## Services

### API Service

The API service handles user authentication, course management, and question management. It is built using FastAPI and includes several endpoints for interacting with the system.

### RAG Service

The RAG service is responsible for handling the GraphRAG model, which retrieves and generates answers based on course resources stored in a Neo4j graph database. The RAG service is only accessible by the API service to ensure secure and controlled access.

## Setup and Installation

### Prerequisites

- Python 3.8+
- Docker
- Docker Compose

### Running the Services

1. **Clone the repository**:
   ```sh
   git clone https://github.com/CSC392-CSC492-Building-AI-ML-systems/personalAITutor.git
   cd personal-ai-tutor
   ```

2. **Update environment variables**:
   ```sh
   cd ai-tutor
   ```

3. Update the environment vairbales in the `docker-compose.yml file`

4. **Build and start the containers**:
   ```sh
   docker-compose up --build
   ```
