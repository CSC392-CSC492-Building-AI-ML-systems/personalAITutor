from api_service import create_app
from flask_cors import CORS

app = create_app()

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

if __name__ == '__main__':
    app.run(debug=True, port=7000)