from api_service import create_app
from flask_cors import CORS

app = create_app()

# Enable CORS for specific origins (allow localhost for development)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://advsry.utm.utoronto.ca"]}})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7001)