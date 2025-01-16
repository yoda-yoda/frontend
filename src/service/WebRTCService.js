import webSocketService from './SignalService';

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.dataChannels = {}; // 여러 데이터채널을 관리하기 위한 객체
  }

  // WebRTC 연결 초기화
  initConnection(iceServers) {
    this.peerConnection = new RTCPeerConnection({ iceServers });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate generated:", event.candidate);
        webSocketService.sendMessage({
          type: "iceCandidate",
          candidate: event.candidate,
        });

        webSocketService.sendMessage({
          type: "iceCandidate",
          candidate: event.candidate,
        });

      } 
    };
  }

  // 데이터채널 생성
  createDataChannel(channelName, onMessageCallback) {
    if (!this.peerConnection) {
      throw new Error("PeerConnection is not initialized. Call initConnection first.");
    }

    // 데이터채널 생성 및 이벤트 핸들러 설정
    const dataChannel = this.peerConnection.createDataChannel(channelName);
    this.dataChannels[channelName] = dataChannel;

    dataChannel.onopen = () => {
      console.log(`DataChannel '${channelName}' is open!`);
    };

    dataChannel.onmessage = (event) => {
      console.log(`Message from DataChannel '${channelName}':`, event.data);
      if (onMessageCallback) onMessageCallback(event.data);
    };

    return dataChannel;
  }

  // Offer 생성 및 전송
  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    console.log("Generated Offer SDP:", offer.sdp);
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Answer 설정
  async setRemoteAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // ICE 후보 추가
  async addIceCandidate(candidate) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // 데이터 전송
  sendMessage(channelName, message) {
    const dataChannel = this.dataChannels[channelName];
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(message);
    } else {
      console.error(`DataChannel '${channelName}' is not open.`);
      console.log(`PeerConnection state: ${this.peerConnection.connectionState}`);
      console.log(`DataChannel state: ${dataChannel ? dataChannel.readyState : "null"}`);
      console.log(`message: ${message}`);
    }
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;
