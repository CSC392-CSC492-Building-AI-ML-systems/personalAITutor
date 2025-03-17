import unittest
from api_service import db, create_app
import json

class CustomTestResult(unittest.TextTestResult):
    def addSuccess(self, test):
        super().addSuccess(test)
        self.stream.write(f"✔ {test}\n\n")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self.stream.write(f"✘ {test}\n\n")

    def addError(self, test, err):
        super().addError(test, err)
        self.stream.write(f"⚠ {test}\n\n")

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self.stream.write(f"↩ {test} (skipped: {reason})\n\n")

class CustomTestRunner(unittest.TextTestRunner):
    resultclass = CustomTestResult

class FlaskAppTestCase(unittest.TestCase):
    def create_app(self):
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app

    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def update_courses(self):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer R6JV8jeiZx"
        }
        response = self.client.post(
            "/update-courses",
            headers=headers
        )
        print("Update Courses:", response.get_json())
        self.assertEqual(response.status_code, 200)

    def test_update_courses(self):
        self.update_courses()

    def test_access_flowchart_without_registering(self):
        response = self.client.get("/courses/get-flowchart/CSC207")
        print("Access Flowchart without Registering:", response.get_json())
        self.assertEqual(response.status_code, 401)

    def test_register_login(self):
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

    def test_user_flow(self):
        register_payload = {
            "username": "newuser1",
            "email": "newuser1@example.com",
            "password": "password123"
        }
        response = self.client.post(
            "/auth/register",
            data=json.dumps(register_payload),
            content_type="application/json"
        )
        print("Register:", response.get_json())
        self.assertEqual(response.status_code, 201)

        login_payload = {
            "email": "newuser1@example.com",
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

        auth_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        # question_payload = {
        #     "question": "Describe the differences between the observer and iterator patterns?"
        # }
        # response = self.client.post(
        #     "/ask/CSC207",
        #     data=json.dumps(question_payload),
        #     headers=auth_headers
        # )
        # print("Ask:", response.get_json())
        # self.assertEqual(response.status_code, 403)

        response = self.client.get("/courses/get-flowchart/CSC207", headers=auth_headers)
        flowchart_text = response.data.decode("utf-8")
        print("Flowchart:", flowchart_text)
        self.assertEqual(response.status_code, 200)

        response = self.client.delete("/auth/delete-questions/CSC207", headers=auth_headers)
        print("Delete Questions:", response.get_json())
        self.assertEqual(response.status_code, 200)

        response = self.client.delete("/auth/delete-user", headers=auth_headers)
        print("Delete User:", response.get_json())
        self.assertEqual(response.status_code, 200)

    def test_enroll_then_test_user_flow(self):
        self.update_courses()

        register_payload = {
            "username": "newuser2",
            "email": "newuser2@example.com",
            "password": "password123"
        }
        response = self.client.post(
            "/auth/register",
            data=json.dumps(register_payload),
            content_type="application/json"
        )
        print("Register:", response.get_json())
        self.assertEqual(response.status_code, 201)

        login_payload = {
            "email": "newuser2@example.com",
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

        auth_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        response = self.client.post(
            "/courses/enroll/CSC207",
            headers=auth_headers
        )
        print("Enroll:", response.get_json())
        self.assertEqual(response.status_code, 200)

        # Lines for test_user_flow after enrolling
        # question_payload = {
        #     "question": "Describe the differences between the observer and iterator patterns?"
        # }
        # response = self.client.post(
        #     "/ask/CSC207",
        #     data=json.dumps(question_payload),
        #     headers=auth_headers
        # )
        # print("Ask:", response.get_json())
        # self.assertEqual(response.status_code, 200)

        response = self.client.get("/courses/get-flowchart/CSC207", headers=auth_headers)
        flowchart_text = response.data.decode("utf-8")
        print("Flowchart:", flowchart_text)
        self.assertEqual(response.status_code, 200)

        response = self.client.delete("/auth/delete-questions/CSC207", headers=auth_headers)
        print("Delete Questions:", response.get_json())
        self.assertEqual(response.status_code, 200)

        response = self.client.delete("/auth/delete-user", headers=auth_headers)
        print("Delete User:", response.get_json())
        self.assertEqual(response.status_code, 200)

    def test_register_login_logout_access_flowchart(self):
        register_payload = {
            "username": "newuser3",
            "email": "newuser3@example.com",
            "password": "password123"
        }
        response = self.client.post(
            "/auth/register",
            data=json.dumps(register_payload),
            content_type="application/json"
        )
        print("Register:", response.get_json())
        self.assertEqual(response.status_code, 201)

        login_payload = {
            "email": "newuser3@example.com",
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

        auth_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        response = self.client.post("/auth/logout", headers=auth_headers)
        print("Logout:", response.get_json())
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/courses/get-flowchart/CSC207", headers=auth_headers)
        print("Access Flowchart after Logout:", response.get_json())
        self.assertEqual(response.status_code, 401)

    def test_get_courses_not_enrolled(self):
        register_payload = {
            "username": "newuser4",
            "email": "newuser4@example.com",
            "password": "password123"
        }
        response = self.client.post(
            "/auth/register",
            data=json.dumps(register_payload),
            content_type="application/json"
        )
        print("Register:", response.get_json())
        self.assertEqual(response.status_code, 201)

        login_payload = {
            "email": "newuser4@example.com",
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

        auth_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        response = self.client.get("/courses/user-courses", headers=auth_headers)
        print("Get Courses:", response.get_json())
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main(testRunner=CustomTestRunner())