import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'teste'

        # Rejoindre le groupe
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')

        print(f"Message reçu: {message}")

        # Envoyer à tout le groupe
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',   # ← doit correspondre au nom de la méthode
                'message': message
            }
        )

    # Cette méthode est appelée automatiquement grâce au 'type': 'chat_message'
    def chat_message(self, event):
        message = event['message']

        # Envoyer au WebSocket du client
        self.send(text_data=json.dumps({
            'type': 'chat_message',   # ← même nom que dans le JS
            'message': message
        }))

    def disconnect(self, close_code):
        # Quitter le groupe proprement
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )