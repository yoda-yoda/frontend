import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tiptap from "../../components/tiptap/Tiptap";
import NoteHeader from "../../components/common/NoteHeader";
import Sidebar from "../../components/common/Sidebar";
import { saveNote } from "../../service/NoteService";
import webSocketService from "../../service/SignalService";
import webRTCService from "../../service/WebRTCService";
import "./TeamNote.css";

const TeamNote = () => {
  const { team_id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const participants = [
    { name: "Alice", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s", color: "#918A70"},
    { name: "Bob", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s", color: "#9AE6E8"},
    { name: "Charlie", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s", color: "#C51790"},
  ];
  
  const tiptapRef = useRef(null);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    webSocketService.connect();

    const handleWebSocketMessage = async (message) => {
      console.log("WebSocket message:", message);

      if (message.type === "answer") {
        await webRTCService.setRemoteAnswer({
          type: "answer",
          sdp: message.sdp,
        });
      } else if (message.type === "iceCandidate") {
        await webRTCService.addIceCandidate(message.candidate);
      }
    };

    webSocketService.addMessageHandler(handleWebSocketMessage);

    const initiateWebRTC = async () => {
      webRTCService.initConnection([
        // { urls: "stun:stun.l.google.com:19302" },
        { urls: "turn:127.0.0.1:3478", username: "user", credential: "pass" },
      ]);

      webRTCService.createDataChannel("note/1", (data) => {
        console.log("DataChannel message:", data);
      });

      const offer = await webRTCService.createOffer();
      if (!webRTCService.peerConnection.localDescription) {
        await webRTCService.peerConnection.setLocalDescription(offer);
      }
      webSocketService.sendMessage({
        type: "offer",
        sdp: offer.sdp,
      });
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
    <div className={`team-note ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <NoteHeader 
        participants={participants} 
        onBack={handleBack}
        onShare={handleShare} 
        onChat={handleChat}
        onMenu={handleMenuClick}
        onSave={() => tiptapRef.current.handleSave()}
      />

      <main>
        <Tiptap ref={tiptapRef} onSave={handleSave} team_id={"1"} participants={participants} />
      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />

    </div>
  );
};

export default TeamNote;