
import json
from channels.generic.websocket import WebsocketConsumer

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Vous êtes connecté'
        }))

    def receive(self, text_data):
        data = json.loads(text_data)
        # Traiter le message ici
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': data.get('message', '')
        }))

    def disconnect(self, close_code):
        pass