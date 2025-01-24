// service/AudioWebRTCService.js
import audioSocketService from "./AudioSocketService";

class AudioWebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onTrackCallback = null;

    // this.handleNegotiationNeeded = this.handleNegotiationNeeded.bind(this);
  }

  async initConnection(iceServers, onTrack) {
    try {
      // 1) PeerConnection 생성
      this.peerConnection = new RTCPeerConnection({ iceServers });
      this.onTrackCallback = onTrack;

      // (옵션) 확실하게 sendrecv로 트랜시버 설정
      this.peerConnection.addTransceiver("audio", {
        direction: "sendrecv",
      });

      // 2) ICE Candidate 트리클링
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending local ICE candidate:", event.candidate);
          audioSocketService.sendMessage({
            type: "iceCandidate",
            candidate: event.candidate,
          });
        }
      };

      // 3) remote track 수신 처리
      this.peerConnection.ontrack = (event) => {
        console.log("Remote track event:", event.streams);
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
        if (this.onTrackCallback) {
          this.onTrackCallback(this.remoteStream);
        }
      };

      // 4) onnegotiationneeded 처리
      this.peerConnection.onnegotiationneeded = this.handleNegotiationNeeded;

      // 5) 마이크 스트림
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // (중요) 이제는 여기서 audioSocketService.connect()를 **호출 안 함**.
      // WebSocket 연결 순서는 컴포넌트에서 보장.

      console.log("initConnection: success");
      return true;
    } catch (error) {
      console.error("initConnection error:", error);
      throw error;
    }
  }

  // async handleNegotiationNeeded() {
  //   try {
  //     console.log("[NegotiationNeeded] Creating new local offer...");
  //     const offer = await this.peerConnection.createOffer();
  //     await this.peerConnection.setLocalDescription(offer);

  //     audioSocketService.sendMessage({
  //       type: "offer",
  //       sdp: offer.sdp,
  //     });
  //     console.log("[NegotiationNeeded] Sent offer to server");
  //   } catch (err) {
  //     console.error("handleNegotiationNeeded error:", err);
  //   }
  // }

  async handleSocketMessage(message) {
    console.log("WebSocket message received in AudioWebRTCService:", message);

    if (message.type === "offer") {
      // 서버가 re-offer (또는 처음부터 서버가 offerer) 보낼 수도 있으므로 처리
      console.log("[Client] got offer from server. Setting remote desc...");
      const remoteDesc = new RTCSessionDescription({
        type: "offer",
        sdp: message.sdp,
      });
      await this.peerConnection.setRemoteDescription(remoteDesc);
      console.log("[Client] remote offer set. Creating answer...");

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // 보내기
      audioSocketService.sendMessage({
        type: "answer",
        sdp: answer.sdp,
      });
      console.log("[Client] answer sent to server.");

    } else if (message.type === "answer") {
      // 기존 흐름: 클라이언트가 offerer 일 때 서버가 준 answer 처리
      const remoteDesc = new RTCSessionDescription({
        type: "answer",
        sdp: message.sdp,
      });
      await this.peerConnection.setRemoteDescription(remoteDesc);
      console.log("Remote description (answer) set!");
    } else if (message.type === "iceCandidate") {
      // ICE 후보
      const candidate = new RTCIceCandidate(message.candidate);
      await this.peerConnection.addIceCandidate(candidate);
      console.log("Remote ICE candidate added!");
    }
  }

  // (선택) 처음 시작 시 오퍼를 만드는 함수
  async startCall() {
    try {
      console.log("startCall: creating offer...");
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log("startCall: LocalDescription set. Sending offer to server...");

      audioSocketService.sendMessage({
        type: "offer",
        sdp: offer.sdp,
      });
    } catch (error) {
      console.error("startCall error:", error);
    }
  }

  closeConnection() {
    console.log("Closing WebRTC connection...");
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    audioSocketService.disconnect();
  }
}

const audioWebRTCService = new AudioWebRTCService();
export default audioWebRTCService;