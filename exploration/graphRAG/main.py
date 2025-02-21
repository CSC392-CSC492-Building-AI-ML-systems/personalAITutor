import os
import pandas as pd
from typing import List, Dict, Tuple
from urllib.parse import urlparse
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Neo4jVector
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    WebBaseLoader, 
    PlaywrightURLLoader, 
    PyPDFLoader,
    YoutubeLoader
)

class ResourceProcessor:
    """Handles the processing of different types of resources."""
    
    @staticmethod
    def is_youtube_url(url: str) -> bool:
        """Check if URL is a YouTube video."""
        parsed = urlparse(url)
        return 'youtube.com' in parsed.netloc or 'youtu.be' in parsed.netloc

    @staticmethod
    def safe_load_resource(url: str, resource_type: str) -> List[Document]:
        """
        Safely load content from different resource types.
        """
        try:
            if resource_type.lower() == 'webpage':
                try:
                    loader = WebBaseLoader(url)
                    return loader.load()
                except Exception as e:
                    print(f"WebBaseLoader failed for {url}: {e}")
                    loader = PlaywrightURLLoader([url])
                    return loader.load()
                    
            elif resource_type.lower() == 'pdf':
                if "http" not in url:
                    absolute_path = os.path.abspath(url) 
                    loader = PyPDFLoader(absolute_path)
                    return loader.load()
                else:
                    loader = PyPDFLoader(url)
                    return loader.load()
                
            elif resource_type.lower() == 'yt video':
                loader = YoutubeLoader.from_youtube_url(
                    url,
                    add_video_info=True,
                    language=['en']
                )
                return loader.load()
                
            else:
                print(f"Unsupported resource type: {resource_type}")
                return []
                
        except Exception as e:
            print(f"Failed to load resource {url}: {e}")
            return []

class TopicHierarchyManager:
    """Manages the topic hierarchy and categorization."""
    
    def __init__(self):
        self.topic_hierarchy = {
            "Software Development": {
                "Programming Concepts": {
                    "Object-Oriented Programming": {
                        "keywords": ["oop", "object oriented", "class", "inheritance", "polymorphism"],
                        "subtopics": {
                            "Basic Concepts": ["classes", "objects", "methods"],
                            "SOLID Principles": ["single responsibility", "open closed", "liskov"],
                            "Design Principles": ["encapsulation", "abstraction"]
                        }
                    },
                    "Java Programming": {
                        "keywords": ["java", "jvm", "bytecode"],
                        "subtopics": {
                            "Java Basics": ["data types", "control flow", "methods"],
                            "Java OOP": ["classes", "interfaces", "inheritance"],
                            "Java Advanced": ["generics", "exceptions", "io"]
                        }
                    }
                },
                "Development Practices": {
                    "Version Control": {
                        "keywords": ["git", "version control", "repository"],
                        "subtopics": {
                            "Git Basics": ["repository", "commit", "branch"],
                            "Git Advanced": ["merge", "rebase", "workflow"],
                            "Collaboration": ["remote", "pull request", "fork"]
                        }
                    },
                    "Pair Programming": {
                        "keywords": ["pair programming", "paired", "collaboration"],
                        "subtopics": {
                            "Practices": ["driver navigator", "code review"],
                            "Benefits": ["knowledge sharing", "code quality"],
                            "Challenges": ["coordination", "communication"]
                        }
                    }
                },
                "Software Methodologies": {
                    "Agile": {
                        "keywords": ["agile", "scrum", "sprint"],
                        "subtopics": {
                            "Principles": ["iterative", "incremental", "adaptive"],
                            "Practices": ["daily standup", "retrospective"],
                            "Artifacts": ["backlog", "user story", "burndown"]
                        }
                    },
                    "Waterfall": {
                        "keywords": ["waterfall", "sequential", "traditional"],
                        "subtopics": {
                            "Phases": ["requirements", "design", "implementation"],
                            "Characteristics": ["sequential", "documented"],
                            "Applications": ["regulated", "stable requirements"]
                        }
                    }
                },
                "Software Design": {
                    "UML Diagrams": {
                        "keywords": ["uml", "diagram", "modeling"],
                        "subtopics": {
                            "Structural Diagrams": ["class diagram", "component diagram"],
                            "Behavioral Diagrams": ["sequence diagram", "activity diagram"],
                            "Use Case Diagrams": ["actor", "system boundary"]
                        }
                    },
                    "Design Patterns": {
                        "keywords": ["design pattern", "gof", "software pattern"],
                        "subtopics": {
                            "Creational": ["singleton", "factory", "builder"],
                            "Structural": ["adapter", "decorator", "facade"],
                            "Behavioral": ["observer", "strategy", "command"]
                        }
                    }
                }
            }
        }

    def categorize_resource(self, content: str, url: str, main_topic: str) -> Dict[str, List[str]]:
        """
        Categorize a resource into subtopics based on content and URL.
        """
        categorization = {"main_topic": main_topic, "subtopics": [], "keywords": []}
        
        # Convert content and URL to lowercase for case-insensitive matching
        content_lower = content.lower()
        url_lower = url.lower()
        
        # Find the main topic category in hierarchy
        for category, details in self.topic_hierarchy["Software Development"].items():
            for topic, topic_details in details.items():
                if any(keyword in content_lower or keyword in url_lower 
                      for keyword in topic_details["keywords"]):
                    
                    categorization["subtopics"].append(topic)
                    categorization["keywords"].extend(
                        [kw for kw in topic_details["keywords"] 
                         if kw in content_lower or kw in url_lower]
                    )
                    
                    # Check for more specific subtopics
                    for subtopic_category, subtopics in topic_details["subtopics"].items():
                        if any(subtopic in content_lower or subtopic in url_lower 
                              for subtopic in subtopics):
                            categorization["subtopics"].append(f"{topic}:{subtopic_category}")
        
        return categorization

class GraphRAGManager:
    def __init__(self, uri: str, username: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
        self.embeddings = OpenAIEmbeddings()
        self.resource_processor = ResourceProcessor()
        self.topic_manager = TopicHierarchyManager()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", "!", "?"]
        )

    def process_dataset(self, csv_path: str):
        """
        Process the dataset and create the knowledge graph.
        """
        df = pd.read_csv(csv_path)
        
        with self.driver.session() as session:
            # Create constraints and indexes
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE")
            session.run("CREATE INDEX IF NOT EXISTS FOR (r:Resource) ON (r.url)")
            
            for _, row in df.iterrows():
                if row['Processed'] == 'Y':  # Only process items marked as processed
                    url = row['Filename']
                    resource_type = row['Resource type']
                    main_topic = row['Subtopic']
                    
                    # Load and process the resource
                    documents = self.resource_processor.safe_load_resource(url, resource_type)
                    
                    for doc in documents:
                        # Categorize the content
                        categorization = self.topic_manager.categorize_resource(
                            doc.page_content, url, main_topic
                        )
                        
                        # Split into chunks
                        chunks = self.text_splitter.split_documents([doc])
                        
                        for chunk in chunks:
                            # Generate embedding
                            embedding = self.embeddings.embed_documents([chunk.page_content])[0]
                            
                            # Create resource node and relationships
                            self._create_resource_node(
                                session,
                                url,
                                chunk.page_content,
                                embedding,
                                resource_type,
                                categorization
                            )

    def _create_resource_node(self, session, url: str, content: str, 
                            embedding: List[float], resource_type: str, 
                            categorization: Dict[str, List[str]]):
        """
        Create a resource node and its relationships in the graph.
        """
        # Create resource node with content and embedding
        session.run("""
            MERGE (r:Resource {url: $url})
            SET r.content = $content,
                r.embedding = $embedding,
                r.type = $type
            """,
            url=url,
            content=content,
            embedding=embedding,
            type=resource_type
        )
        
        # Create topic nodes and relationships
        main_topic = categorization["main_topic"]
        session.run("""
            MERGE (t:Topic {name: $topic})
            WITH t
            MATCH (r:Resource {url: $url})
            MERGE (r)-[:BELONGS_TO]->(t)
        """,
        topic=main_topic,
        url=url
        )
        
        # Create subtopic relationships
        for subtopic in categorization["subtopics"]:
            if ":" in subtopic:
                parent, child = subtopic.split(":")
                session.run("""
                    MERGE (p:Topic {name: $parent})
                    MERGE (c:Topic {name: $child})
                    MERGE (p)-[:INCLUDES]->(c)
                    WITH c
                    MATCH (r:Resource {url: $url})
                    MERGE (r)-[:CATEGORIZED_AS]->(c)
                """,
                parent=parent,
                child=child,
                url=url
                )
            else:
                session.run("""
                    MERGE (t:Topic {name: $subtopic})
                    WITH t
                    MATCH (r:Resource {url: $url})
                    MERGE (r)-[:CATEGORIZED_AS]->(t)
                """,
                subtopic=subtopic,
                url=url
                )

    def query_graph(self, query: str, top_k: int = 5):
        """
        Query the graph for relevant resources.
        """
        with self.driver.session() as session:
            # First try keyword-based topic matching
            results = session.run("""
                MATCH (t:Topic)
                WHERE any(keyword IN t.keywords WHERE toLower($query) CONTAINS toLower(keyword))
                MATCH (r:Resource)-[:CATEGORIZED_AS]->(t)
                RETURN DISTINCT r.content as content, r.url as url, t.name as topic
                LIMIT $top_k
            """,
            query=query,
            top_k=top_k
            )
            
            keyword_matches = list(results)
            
            if not keyword_matches:
                # Fall back to vector similarity search
                query_embedding = self.embeddings.embed_query(query)
                results = session.run("""
                    MATCH (r:Resource)
                    WITH r, gds.similarity.cosine(r.embedding, $embedding) AS score
                    ORDER BY score DESC
                    LIMIT $top_k
                    RETURN r.content as content, r.url as url, score
                """,
                embedding=query_embedding,
                top_k=top_k
                )
                
                return [{
                    'content': record['content'],
                    'url': record['url'],
                    'score': record['score']
                } for record in results]
            
            return [{
                'content': record['content'],
                'url': record['url'],
                'topic': record['topic']
            } for record in keyword_matches]

def main():
    # Initialize the manager
    graph_manager = GraphRAGManager(
        uri="bolt://localhost:7687",
        username="neo4j",
        password="password"
    )
    
    # Process the dataset
    graph_manager.process_dataset("source.csv")
    
    # Example query
    results = graph_manager.query_graph("What is inheritance in Java?")
    for result in results:
        print(f"Content: {result['content'][:200]}...")
        print(f"URL: {result['url']}")
        print(f"Topic: {result.get('topic', 'N/A')}")
        print("---")

if __name__ == "__main__":
    main()