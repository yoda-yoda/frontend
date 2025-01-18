// service/AudioSocketService.js
class AudioSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.messageHandlers = [];
    this._connectedPromise = null;
    this._connectedResolve = null;
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // 이미 열려 있으면 즉시 resolve
      return Promise.resolve();
    }

    // 만약 이미 Promise를 만든 상태라면 그대로 반환
    if (this._connectedPromise) {
      return this._connectedPromise;
    }

    this._connectedPromise = new Promise((resolve, reject) => {
      this._connectedResolve = resolve;

      this.socket = new WebSocket(this.url);
      this.socket.onopen = () => {
        console.log("WebSocket connected");
        // 연결 성공 시 resolve
        if (this._connectedResolve) {
          this._connectedResolve(true);
          this._connectedResolve = null;
        }
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Message received:", message);
        this.messageHandlers.forEach((handler) => handler(message));
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        // 에러 시 reject
        reject(error);
      };
    });

    return this._connectedPromise;
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("AudioSocketService.sendMessage:", message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected. Cannot send:", message);
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
      this._connectedPromise = null;
      this._connectedResolve = null;
    }
  }
}

const audioSocketService = new AudioSocketService("ws://localhost:4000/webrtc/audio");
export default audioSocketService;
