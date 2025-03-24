from flask import Blueprint, request, jsonify
from .models import *
from api_service import db, bcrypt, jwt
from flask_jwt_extended import create_access_token, get_jwt, jwt_required, unset_jwt_cookies, get_jwt_identity

auth = Blueprint('auth', __name__)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()

    return token is not None

@auth.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(username=data['username'], email=data['email'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully", "user": {"username": new_user.username, "email": new_user.email}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        if user and bcrypt.check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity=user.username)
            return jsonify(access_token=access_token, user={"username": user.username, "email": user.email}), 200
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        now = datetime.now(timezone.utc)
        db.session.add(TokenBlocklist(jti=jti, created_at=now))
        db.session.commit()
        return jsonify(msg="JWT revoked")
        # response = jsonify({"message": "User logged out successfully"})
        # unset_jwt_cookies(response)
        # return response, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth.route('/delete-questions/<course_code>', methods=['DELETE'])
@jwt_required()
def delete_questions(course_code):
    user_id = get_jwt_identity()

    try:
        # Check if there are any questions to delete for the specified course
        questions = Question.query.filter_by(user_id=user_id, course_code=course_code).all()
        if not questions:
            return jsonify({"message": "No questions to delete for the specified course"}), 200

        # Delete all questions for the authenticated user and specified course
        Question.query.filter_by(user_id=user_id, course_code=course_code).delete()
        db.session.commit()
        return jsonify({"message": "All questions and answers for the specified course deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth.route('/delete-user', methods=['DELETE'])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    try:
        # Retrieve the course codes associated with the user using the association table's columns
        course_codes = [
            row[0] for row in db.session.query(user_courses.c.course_code)
            .filter(user_courses.c.user_id == user_id).all()
        ]

        # Delete all questions and enrollments for each course in one transaction
        for course_code in course_codes:
            # Delete all questions for this user and course
            db.session.query(Question).filter(
                Question.user_id == user_id,
                Question.course_code == course_code
            ).delete(synchronize_session=False)

            # Delete the user's enrollment from the association table
            db.session.execute(
                user_courses.delete().where(
                    user_courses.c.user_id == user_id,
                    user_courses.c.course_code == course_code
                )
            )

        # Delete the user record
        db.session.query(User).filter(User.id == user_id).delete()

        db.session.commit()
        return jsonify({"message": "User and all associated entries deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
