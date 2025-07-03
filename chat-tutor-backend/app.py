from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from dotenv import load_dotenv
import os

from controllers.chat import ChatController
from controllers.topic import TopicController

app = Flask(__name__)

CORS(app, origins=['http://localhost:5173'])

api = Api(app)

# definir mis rutas del proyecto
api.add_resource(TopicController, '/api/v1/topics')
api.add_resource(ChatController, '/api/v1/chat')

if __name__ == '__main__':
    app.run(debug=True)