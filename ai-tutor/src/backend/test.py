import unittest
from app import create_app
from __init__ import db
import json

class FlaskAppTestCase(unittest.TestCase):
    def create_app(self):
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app

    def setUp(self):
        # Create an instance of your app with testing configuration
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        # Create database tables
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        # Drop all database tables
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_user_flow(self):
        # 1. Register a new user
        register_payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123"
        }
        response = self.client.post(
            "/auth/register",
            data=json.dumps(register_payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        print("Register:", response.get_json())

        # 2. Login with the new user
        login_payload = {
            "email": "newuser@example.com",
            "password": "password123"
        }
        response = self.client.post(
            "/auth/login",
            data=json.dumps(login_payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        login_data = response.get_json()
        self.assertIn("access_token", login_data)
        access_token = login_data["access_token"]
        print("Login:", login_data)

        # Prepare auth headers using the received token
        auth_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        # 3. Ask a question
        # question_payload = {
        #     "question": "Describe the differences between the observer and iterator patterns?",
        #     "retriever_type": "HybridRetriever"
        # }
        # response = self.client.post(
        #     "/ask",
        #     data=json.dumps(question_payload),
        #     headers=auth_headers
        # )
        # self.assertEqual(response.status_code, 200)
        # print("Ask:", response.get_json())

        # 4. Get the flowchart
        response = self.client.get("/get-flowchart", headers=auth_headers)
        self.assertEqual(response.status_code, 200)
        flowchart_text = response.data.decode("utf-8")
        print("Flowchart:", flowchart_text)

        # 5. Delete all questions
        response = self.client.delete("/delete-questions", headers=auth_headers)
        self.assertEqual(response.status_code, 200)
        print("Delete Questions:", response.get_json())

        # 6. Delete the user
        response = self.client.delete("/auth/delete-user", headers=auth_headers)
        self.assertEqual(response.status_code, 200)
        print("Delete User:", response.get_json())

if __name__ == '__main__':
    unittest.main()
