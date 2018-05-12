from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_cors import CORS, cross_origin

app = Flask(__name__)
app.config.from_object('config')
CORS(app)

db = SQLAlchemy(app)

admin = Admin(app,template_mode='bootstrap3')

from app import views
