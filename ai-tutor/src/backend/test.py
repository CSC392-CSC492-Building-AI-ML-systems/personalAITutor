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

    def test_access_flowchart_without_registering(self):
        # Try to access the flowchart without registering
        response = self.client.get("/get-flowchart")
        print("Access Flowchart without Registering:", response.get_json())
        self.assertEqual(response.status_code, 401)

    def test_register_login_logout(self):
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
        print("Register:", response.get_json())
        self.assertEqual(response.status_code, 201)

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
        login_data = response.get_json()
        self.assertIn("access_token", login_data)
        access_token = login_data["access_token"]
        print("Login:", login_data)
        self.assertEqual(response.status_code, 200)

        # Prepare auth headers using the received token
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }


    def test_user_flow(self):
        auth_headers = self.test_register_login_logout()

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
        # print("Ask:", response.get_json())
        # self.assertEqual(response.status_code, 200)

        # 4. Get the flowchart
        response = self.client.get("/get-flowchart", headers=auth_headers)
        flowchart_text = response.data.decode("utf-8")
        print("Flowchart:", flowchart_text)
        self.assertEqual(response.status_code, 200)

        # 5. Delete all questions
        response = self.client.delete("/auth/delete-questions", headers=auth_headers)
        print("Delete Questions:", response.get_json())
        self.assertEqual(response.status_code, 200)

        # 6. Delete the user
        response = self.client.delete("/auth/delete-user", headers=auth_headers)
        print("Delete User:", response.get_json())
        self.assertEqual(response.status_code, 200)

    def test_register_login_logout_access_flowchart(self):
        auth_headers = self.test_register_login_logout()

        # 3. Logout
        response = self.client.post("/auth/logout", headers=auth_headers)
        print("Logout:", response.get_json())
        self.assertEqual(response.status_code, 200)

        # 4. Try to access the flowchart
        response = self.client.get("/get-flowchart", headers=auth_headers)
        print("Access Flowchart after Logout:", response.get_json())
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
