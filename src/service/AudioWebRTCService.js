class AudioWebRTCService {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.onMessageCallback = null;
  }

  async initConnection(onMessage) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.remoteStream = new MediaStream();

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:127.0.0.1:3478',
          username: 'user',
          credential: 'pass',
        },
      ],
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream.addTrack(event.track);
      if (this.onMessageCallback) {
        this.onMessageCallback(this.remoteStream);
      }
    };

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.socket = new WebSocket('ws://localhost:4000/webrtc');
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.socket.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
      } else if (data.type === 'iceCandidate') {
        const candidate = new RTCIceCandidate(data.candidate);
        this.peerConnection.addIceCandidate(candidate);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    if (onMessage) this.onMessageCallback = onMessage;
  }

  closeConnection() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    if (this.socket) {
      this.socket.close();
    }
  }
}

const audioWebRTCService = new AudioWebRTCService();
export default audioWebRTCService;