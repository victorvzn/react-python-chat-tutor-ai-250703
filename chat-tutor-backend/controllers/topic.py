from flask_restful import Resource, request

class TopicController(Resource):
  def get(self):
    return [
      {"id": "greetings", "name": "Greetings"},
      {"id": "travel", "name": "Travel"},
      {"id": "movies", "name": "Movies"},
      {"id": "airport", "name": "At the Airport"},
      {"id": "job-interview", "name": "Job Interview"},
    ]