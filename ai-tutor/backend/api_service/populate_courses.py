from flask import Blueprint, jsonify, request
import json
import os
from .models import Course
from api_service import db

VALID_API_KEY = os.getenv('VALID_API_KEY')

populate_courses = Blueprint('populate_courses', __name__)

@populate_courses.route('/update-courses', methods=['POST'])
def update_courses():
    api_key = request.headers.get('Authorization')

    if api_key != f"Bearer {VALID_API_KEY}":
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        with open('assets/courses.json', 'r') as file:
            courses = json.load(file)

            for course_data in courses:
                course = Course.query.filter_by(name=course_data['name']).first()
                if course:
                    course.description = course_data['description']
                else:
                    course = Course(name=course_data['name'], description=course_data['description'])
                    db.session.add(course)
            db.session.commit()

            return jsonify({"message": "Courses populated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500