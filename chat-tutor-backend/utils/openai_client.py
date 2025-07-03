def send_message_to_chatgpt(messages):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # o "gpt-3.5-turbo"
            messages=messages,
        )
        return response.choices[0].message["content"]
    except Exception as e:
        return f"Error: {str(e)}"