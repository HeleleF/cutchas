from database import db

class Puzzle(db.Model):
    '''
    The Database Model for a cutcaptcha puzzle
    '''
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(36), unique=True, nullable=False)
    token = db.Column(db.String(32), nullable=True)
    x0 = db.Column(db.Integer, nullable=True)
    y0 = db.Column(db.Integer, nullable=True)
    x1 = db.Column(db.Integer, nullable=True)
    y1 = db.Column(db.Integer, nullable=True)
    x2 = db.Column(db.Integer, nullable=True)
    y2 = db.Column(db.Integer, nullable=True)
    typ = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'Puzzle <{self.question}> is currently {self.typ}'