class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.messageHandlers = [];
  }

  connect() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Message received:', message);

        this.messageHandlers.forEach((handler) => handler(message));
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocketService.sendMessage:', message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // 팀 데이터 전송
  sendTeamData(team_id, data_type, participant) {
    const message = {
      type: "addParticipant",
      team_id: team_id,
      data_type: data_type, // 예: "note", "canvas", "voice"
      participant: participant,
    };
    this.sendMessage(message);
  }
}

const webSocketService = new WebSocketService('ws://localhost:4000/webrtc');
export default webSocketService;
