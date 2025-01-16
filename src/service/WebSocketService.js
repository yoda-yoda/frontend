class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.messageQueue = [];
  }

  connect() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;

        // 대기 중인 메시지 전송
        this.messageQueue.forEach((msg) => this.socket.send(msg));
        this.messageQueue = [];
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Message received:', message);

        this.messageHandlers.forEach((handler) => handler(message));
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
      this.messageQueue.push(msgString); 
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

const webSocketService = new WebSocketService('ws://localhost:4000/ws');
export default webSocketService;
