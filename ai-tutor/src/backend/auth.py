from flask import Blueprint, request, jsonify
from models import User, Question
from __init__ import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, unset_jwt_cookies, get_jwt_identity

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(username=data['username'], email=data['email'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
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
            return jsonify(access_token=access_token), 200
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        response = jsonify({"message": "User logged out successfully"})
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth.route('/delete-user', methods=['DELETE'])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    try:
        # Delete all questions for the authenticated user
        Question.query.filter_by(user_id=user_id).delete()
        # Delete the user
        User.query.filter_by(username=user_id).delete()
        db.session.commit()
        return jsonify({"message": "User and all associated entries deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500