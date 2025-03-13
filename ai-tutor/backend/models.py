from __init__ import db
from datetime import datetime, timezone

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    courses = db.relationship('Course', secondary='user_courses', back_populates='users')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_name = db.Column(db.String(100), db.ForeignKey('course.name'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    answer_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    user = db.relationship('User', backref=db.backref('questions', lazy=True))
    course = db.relationship('Course', backref=db.backref('questions', lazy=True))

class Course(db.Model):
    name = db.Column(db.String(100), primary_key=True)
    description = db.Column(db.String(255), nullable=True)
    users = db.relationship('User', secondary='user_courses', back_populates='courses')

user_courses = db.Table('user_courses',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_name', db.String(100), db.ForeignKey('course.name'), primary_key=True)
)

class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)