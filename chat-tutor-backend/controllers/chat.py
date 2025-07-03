from flask_restful import Resource, request

class ChatController(Resource):
  def get(self):
    return {
      'content': 'resultado'
    }

  def post(self):
    data = request.get_json()

    messages = data.get("messages")

    if not messages or not isinstance(messages, list):
        return jsonify({"error": "messages must be a non-empty list"}), 400

    response = send_message_to_chatgpt(messages)
    return jsonify({"reply": response})