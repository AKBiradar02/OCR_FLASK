from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from app.models.user import User
from app import db

auth_bp = Blueprint('auth', __name__)

# API authentication routes


@auth_bp.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('password'):
            return jsonify({"error": "Missing username or password"}), 400

        user = User.query.filter_by(username=data['username']).first()
        if user is None or not user.check_password(data['password']):
            return jsonify({"error": "Invalid username or password"}), 401

        login_user(user)
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({"success": True})


@auth_bp.route('/api/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already exists"}), 409

        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 409

        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()
        return jsonify({"success": True})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/api/user', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email
    })
