// service/AudioWebRTCService.js
import audioSocketService from "./AudioSocketService";

class AudioWebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onTrackCallback = null;
    this.isOfferSet = false;
    this.isAnswerSet = false;
  }

  async initConnection(iceServers, onTrack) {
    try {
      // 기존 PeerConnection이 있으면 종료
      if (this.peerConnection) {
        console.log("Closing existing PeerConnection before initializing a new one.");
        this.closeConnection();
      }

      // PeerConnection 생성
      this.peerConnection = new RTCPeerConnection({ iceServers });
      this.onTrackCallback = onTrack;

      // sendrecv 트랜시버 설정
      this.peerConnection.addTransceiver("audio", {
        direction: "sendrecv",
      });

      // ICE Candidate 트리클링
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending local ICE candidate:", event.candidate);
          audioSocketService.sendMessage({
            type: "iceCandidate",
            candidate: event.candidate,
          });
        }
      };

      // Remote track 수신 처리
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

      // onnegotiationneeded 처리 (필요 시 활성화)
      // this.peerConnection.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);

      // 마이크 스트림 획득 및 추가
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      console.log("initConnection: success");
      return true;
    } catch (error) {
      console.error("initConnection error:", error);
      throw error;
    }
  }

  async handleSocketMessage(message) {
    console.log("WebSocket message received in AudioWebRTCService:", message);

    if (!this.peerConnection) {
      console.error("PeerConnection is not initialized.");
      return;
    }

    const { type, sdp, candidate } = message;

    if (type === "offer") {
      // 서버가 offer를 보낸 경우 (서버가 offerer인 경우)
      console.log("[Client] Received offer from server. Setting remote description...");
      try {
        const remoteDesc = new RTCSessionDescription({
          type: "offer",
          sdp: sdp,
        });
        await this.peerConnection.setRemoteDescription(remoteDesc);
        this.isOfferSet = true;

        console.log("[Client] Remote offer set. Creating and sending answer...");
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Answer를 서버로 전송
        audioSocketService.sendMessage({
          type: "answer",
          sdp: answer.sdp,
        });
        this.isAnswerSet = true;
        console.log("[Client] Answer sent to server.");
      } catch (error) {
        console.error("Failed to handle offer:", error);
      }

    } else if (type === "answer") {
      // 클라이언트가 offerer인 경우 서버가 보낸 answer 처리
      if (!this.isOfferSet) {
        console.error("Received answer before setting offer.");
        return;
      }
      console.log("[Client] Received answer from server. Setting remote description...");
      try {
        const remoteDesc = new RTCSessionDescription({
          type: "answer",
          sdp: sdp,
        });
        await this.peerConnection.setRemoteDescription(remoteDesc);
        this.isAnswerSet = true;
        console.log("Remote description (answer) set!");
      } catch (error) {
        console.error("Failed to handle answer:", error);
      }

    } else if (type === "iceCandidate") {
      // ICE 후보 추가
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        await this.peerConnection.addIceCandidate(iceCandidate);
        console.log("Remote ICE candidate added!");
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    }
  }

  async startCall() {
    try {
      if (!this.peerConnection) {
        console.error("PeerConnection is not initialized.");
        return;
      }
      console.log("startCall: Creating offer...");
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log("startCall: LocalDescription set. Sending offer to server...");

      // Offer를 서버로 전송
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
    this.remoteStream = null;
    this.onTrackCallback = null;
    this.isOfferSet = false;
    this.isAnswerSet = false;
    console.log("WebRTC connection closed.");

    // WebSocket 연결 종료
    audioSocketService.disconnect();
  }
}

const audioWebRTCService = new AudioWebRTCService();
export default audioWebRTCService;
