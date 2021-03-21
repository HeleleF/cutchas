#!/usr/bin/env python3
import flask
from flask_cors import CORS

import settings
from api.endpoints.cutchas import ns as cutcha_namespace
from api.restx import api
from database import db

app = flask.Flask(__name__)

def configure_app(flask_app: flask.Flask):
    flask_app.config['SERVER_NAME'] = settings.FLASK_SERVER_NAME
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = settings.SQLALCHEMY_DATABASE_URI
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = settings.SQLALCHEMY_TRACK_MODIFICATIONS

def initialize_app(flask_app: flask.Flask):
    configure_app(flask_app)

    api.init_app(flask_app)
    api.add_namespace(cutcha_namespace)

    db.init_app(flask_app)

    CORS(flask_app)

if __name__ == "__main__":

    initialize_app(app)
    app.run(debug=settings.FLASK_DEBUG)
