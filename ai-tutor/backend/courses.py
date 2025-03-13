from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import *
from __init__ import db

courses = Blueprint('courses', __name__)

@courses.route('/get-flowchart/<course_code>', methods=['GET'])
@jwt_required()
def get_flowchart(course_code):
    file_path = f'assets/{course_code}_flowchart.txt'
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        return content
    except FileNotFoundError:
        return jsonify({"error": "Flowchart not found"}), 404
    except Exception as e:
        return str(e), 500

@courses.route('/enroll', methods=['POST'])
@jwt_required()
def add_user_to_course():
    data = request.get_json()
    if not data or 'user_id' not in data or 'course_name' not in data:
        return jsonify({"error": "user_id and course_name are required"}), 400

    user_id = data['user_id']
    course_name = data['course_name']

    # Check if the user is already enrolled in the course
    enrollment = user_courses.query.filter_by(user_id=user_id, course_name=course_name).first()
    if enrollment:
        return jsonify({"error": "User already enrolled in the course"}), 400

    try:
        # Add the user to the course
        new_enrollment = user_courses.insert().values(user_id=user_id, course_name=course_name)
        db.session.execute(new_enrollment)
        db.session.commit()
        return jsonify({"message": "User added to course successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@courses.route('/user-courses', methods=['GET'])
@jwt_required()
def get_user_courses():
    user_id = get_jwt_identity()

    try:
        # Fetch all courses the user is enrolled in
        courses = db.session.query(Course).join(user_courses).filter(user_courses.c.user_id == user_id).all()
        course_list = [{"name": course.name, "description": course.description} for course in courses]
        return jsonify({"courses": course_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500