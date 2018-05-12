from app import db

class Task(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(250), index=True)
	task = db.Column(db.String(5000),index=True)
	completed = db.Column(db.Boolean())
	owner = db.Column(db.String(500))
