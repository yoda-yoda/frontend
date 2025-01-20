import webSocketService from "./WebrtcSocketService";

class NoteWebRTCService {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.onMessageCallback = null;
  }

  initConnection(iceServers) {
    this.peerConnection = new RTCPeerConnection({ iceServers });

    // Handle ICE Candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        webSocketService.sendMessage({
          type: "iceCandidate",
          candidate: event.candidate,
        });
      }
    };

    // Handle Data Channel
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.dataChannel.onmessage = (e) => {
        if (this.onMessageCallback) this.onMessageCallback(e.data);
      };
    };
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  setRemoteAnswer(answer) {
    const desc = new RTCSessionDescription(answer);
    return this.peerConnection.setRemoteDescription(desc);
  }

  addIceCandidate(candidate) {
    return this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  createDataChannel(label, onMessage) {
    this.dataChannel = this.peerConnection.createDataChannel(label);
    this.dataChannel.onmessage = (e) => {
      if (onMessage) onMessage(e.data);
    };
    this.onMessageCallback = onMessage;
  }

  sendData(message) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(message);
    }
  }

  sendDeltaToServer(delta, target) {
    const message = {
      type: "delta",
      target: target,
      delta: delta,
    };
    this.dataChannel.send(JSON.stringify(message));
  }
}

const noteWebRTCService = new NoteWebRTCService();
export default noteWebRTCService;
