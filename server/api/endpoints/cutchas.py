import logging

from flask import request
from flask_restx import Resource

from api.business import get_puzzle, submit_puzzle, update_puzzle, get_stats
#from api.serializers import category, category_with_posts
from api.restx import api
from database.models import Puzzle

log = logging.getLogger(__name__)

ns = api.namespace('cutcha', description='Manage cutcaptcha stuff')

@ns.route('/puzzle')
class PuzzleResource(Resource):

    @ns.doc(description='Gets a new puzzle')
    def get(self):
        '''Gets a new puzzle'''
        return get_puzzle()

    @ns.doc(description='Submits puzzle solution')
    def post(self):
        '''Submits puzzle solution'''
        # force json parsing if mime type is not "application/json"
        data = request.get_json(force=True)
        return submit_puzzle(data)

    @ns.doc(description='Reports a puzzle')
    def put(self):
        '''Reports a puzzle'''
        data = request.get_json(force=True)
        return update_puzzle(data)

@ns.route('/stats')
class StatsResource(Resource):

    @ns.doc(description='Gets puzzle stats')
    def get(self):
        '''Gets puzzle stats'''
        return get_stats()
