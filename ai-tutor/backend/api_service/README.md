# API Service Documentation

The API service is responsible for user authentication, course management, and question handling. It is built using Flask and provides multiple endpoints for interacting with the system.

## Endpoints

### 1. Authentication Endpoints:
- **POST** `/auth/register`:  
  Registers a new user.

- **POST** `/auth/login`:  
  Logs in a user and returns a JWT token.

- **POST** `/auth/logout`:  
  Logs out a user, revokes the JWT token, and adds it to a blocklist for security purposes.

- **DELETE** `/auth/delete-questions/<course_name>`:  
  Deletes all questions for the authenticated user in the specified course.

- **DELETE** `/auth/delete-user`:  
  Deletes the authenticated user along with all associated data.

### 2. Course Management Endpoints:
- **GET** `/courses/get-flowchart/<course_code>`:  
  Retrieves the learning flowchart for the specified course.

- **POST** `/courses/enroll/<course_code>`:  
  Enrolls the authenticated user in the specified course.

- **DELETE** `/courses/drop-course/<course_code>`:  
  Removes the user from the course and deletes all related questions.

- **GET** `/courses/user-courses`:  
  Retrieves a list of courses the user is enrolled in.

### 3. Asking Questions Endpoints:
- **POST** `/ask/<course_code>`:  
  Sends a question related to a course and retrieves an answer from the RAG service.

### 4. Course Population Endpoint:
- **POST** `/update-courses`:  
  Updates the course list from a JSON file.  
  (Access restricted to specific users using a special token.)
