from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
from datetime import timedelta

ACCESS_EXPIRES = timedelta(hours=1)

# Initialize Flask extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    os.environ['FLASK_ENV'] = 'development'
    os.environ['DATABASE_URI'] = 'sqlite:///database.db'
    os.environ['JWT_SECRET_KEY'] = '.8Pte>wy5?rC*c'
    os.environ['NEO4J_URI'] = 'neo4j+s://9a5c6af1.databases.neo4j.io'
    os.environ['NEO4J_USERNAME'] = 'neo4j'
    os.environ['NEO4J_PASSWORD'] = 'LImqHXRqouoA7sJXBsDaXK9WlmPT25up2E8rrcCopLY'
    os.environ['OPENAI_API_KEY'] = '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'
    os.environ['VALID_API_KEY'] = 'R6JV8jeiZx'
    os.environ['RAG_SERVICE_CSC207_URL'] = 'http://rag_service_csc207:6000'

    # Load environment variables
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = ACCESS_EXPIRES

    # Initialize Flask extensions with the app
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from .main import main as main_blueprint
        from .auth import auth as auth_blueprint
        from .courses import courses as courses_blueprint
        from .populate_courses import populate_courses as populate_courses_blueprint

        app.register_blueprint(main_blueprint)
        app.register_blueprint(auth_blueprint, url_prefix='/auth')
        app.register_blueprint(courses_blueprint, url_prefix='/courses')
        app.register_blueprint(populate_courses_blueprint)

        db.create_all()

    return app