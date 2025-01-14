import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Tiptap from "../../components/Tiptap/Tiptap"
import NoteHeader from "../../components/common/NoteHeader";
import { saveNote } from "../../service/NoteService";
import webSocketService from "../../service/SignalService";
import webRTCService from "../../service/WebRTCService";

const TeamNote = () => {
  const { team_id } = useParams();
  const participants = [
    { name: "Alice", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
    { name: "Bob", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
    { name: "Charlie", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
  ];
  
  const tiptapRef = useRef(null);

  useEffect(() => {
    // WebSocket 연결
    webSocketService.connect();

    const handleWebSocketMessage = async (message) => {
      console.log("Message from WebSocket:", message);

      if (message.type === "answer") {
        // 서버로부터 Answer 수신
        try {
          await webRTCService.setRemoteAnswer({
            type: "answer",
            sdp: message.sdp,
          });
        } catch (error) {
          console.error("Error setting remote answer:", error);
        }
      } else if (message.type === "iceCandidate") {
        // 서버로부터 ICE 후보 수신
        try {
          await webRTCService.addIceCandidate(message.candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    webSocketService.addMessageHandler(handleWebSocketMessage);

    const initiateWebRTC = async () => {
      try {
        // WebRTC PeerConnection 초기화
        webRTCService.initConnection([
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "turn:127.0.0.1:3478", username: "user", credential: "password" },
        ]);

        // 데이터 채널 생성
        webRTCService.createDataChannel("note", (data) => {
          console.log("DataChannel message:", data);
        });

        // WebRTC Offer 생성 및 서버로 전송
        const offer = await webRTCService.createOffer();

        // Offer가 이미 설정된 경우를 방지
        if (!webRTCService.peerConnection.localDescription) {
          await webRTCService.peerConnection.setLocalDescription(offer);
        }

        webSocketService.sendMessage({
          type: "offer",
          sdp: offer.sdp,
        });
      } catch (error) {
        console.error("Error during WebRTC initiation:", error);
      }
    };

    initiateWebRTC();

    return () => {
      webSocketService.removeMessageHandler(handleWebSocketMessage);
      webSocketService.disconnect();
    };
  }, [team_id]);

  const handleBack = () => {
    console.log("Back button clicked!");
  };

  const handleShare = () => {
    console.log("Share button clicked!");
  };

  const handleChat = () => {
    console.log("Chat button clicked!");
  };

  const handleSave = async (content) => {
    const note = {
      team_id: "1",
      note: JSON.stringify(content),
      created_at: new Date().toISOString(),
    }

    try {
      const response = await saveNote(note);
    } catch (error) {
      console.error(error);
    }

  };

  return (
    <div className="TeamNote">
      <NoteHeader 
        participants={participants} 
        onBack={handleBack}
        onShare={handleShare} 
        onChat={handleChat}
        onMenu={() => console.log("Menu button clicked!")}
        onSave={() => tiptapRef.current.handleSave()}
      />

      <main>
        <Tiptap ref={tiptapRef} onSave={handleSave} team_id={"1"} />
      </main>

    </div>
  );
};

export default TeamNote;
