import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdCallEnd } from 'react-icons/md';
import './AudioChat.css';
import audioWebRTCService from '../../service/AudioWebRTCService';
import audioSocketService from '../../service/AudioSocketService';
import { useWebSocket } from '../../context/WebSocketContext';

import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/UserAtoms';

const AudioChat = ({ onClose, teamId }) => {
  const [participants, setParticipants] = useState([
    { name: 'Alice', profilePic: '...', volume: 50 },
    { name: 'Bob', profilePic: '...', volume: 50 },
    { name: 'Charlie', profilePic: '...', volume: 50 },
  ]);

  const remoteAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodesRef = useRef([]);
  const { sendMessage, addMessageListener, isConnected } = useWebSocket();
  const messageHandlerRef = useRef(null);
  
  const user = useRecoilValue(userState);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    // STUN/TURN 서버
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:127.0.0.1:3478',
        username: 'user',
        credential: 'pass',
      },
    ];

    // 1) WebSocket 연결
    //    성공하면 -> 2) PeerConnection init -> 3) Offer
    audioSocketService
      .connect()
      .then(() => {
        console.log("WebSocket is open. Now initConnection...");

        // 메시지 핸들러 등록 (이 타이밍에 등록해도 됨)
        const messageHandler = (msg) => {
          audioWebRTCService.handleSocketMessage(msg);
        };
        messageHandlerRef.current = messageHandler;
        audioSocketService.addMessageHandler(messageHandler);

        // 2) WebRTC 연결 초기화
        return audioWebRTCService.initConnection(iceServers, (remoteStream) => {
          // remoteStream이 갱신될 때마다 <audio> 태그에 연결
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play();

            // 각 트랙에 대해 GainNode 설정
            remoteStream.getTracks().forEach((track, index) => {
              if (!gainNodesRef.current[index]) {
                const source = audioContextRef.current.createMediaStreamSource(new MediaStream([track]));
                const gainNode = audioContextRef.current.createGain();
                source.connect(gainNode).connect(audioContextRef.current.destination);
                gainNodesRef.current[index] = gainNode;
              }
            });
          }
        });
      })
      .then(() => {
        console.log("initConnection done -> startCall ", teamId);
        // 3) Offer 보내기
        audioWebRTCService.startCall(teamId);
      })
      .catch((err) => {
        console.error("Failed to set up WebSocket or WebRTC:", err);
      });

    // 언마운트 시 정리
    return () => {
      audioWebRTCService.closeConnection();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (messageHandlerRef.current) {
        audioSocketService.removeMessageHandler(messageHandlerRef.current);
      }
      audioSocketService.disconnect();
    };
  }, []);



  const handleVolumeChange = (index, event) => {
    const newVolume = event.target.value;
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index].volume = newVolume;
      return updated;
    });

    if (gainNodesRef.current[index]) {
      gainNodesRef.current[index].gain.value = newVolume / 100;
    }
  };

  const handleMessage = useCallback((message) => {
    console.log('handleMessage called with:', message);
    if (message.action === 'updateAudioParticipants') {
      const { audioParticipants } = message;
      if (Array.isArray(audioParticipants)) {
        console.log('Updating participants from updateAudioParticipants:', audioParticipants);
        setParticipants(audioParticipants);
      }
    }
    if (message.action === 'getAudioParticipants') {
      // 서버가 participants => UI에 표시
      const { audioParticipants } = message;
      if (Array.isArray(audioParticipants)) {
        console.log('Setting participants from getAudioParticipants:', audioParticipants);
        setParticipants(audioParticipants);
      }
    }
  }, [teamId]);

  useEffect(() => {
    const unsubscribe = addMessageListener(handleMessage);
    console.log('Listener registered for Team:', teamId);

    if (sendMessage) {
      const payload = {
        action: 'getAudioParticipants',
        team_id: String(teamId),
        kind: 'audio',
      };
      console.log('Sending getAudioParticipants:', payload);
      sendMessage(JSON.stringify(payload));
    }

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [addMessageListener, teamId, sendMessage, handleMessage]);

  useEffect(() => {
    if (isConnected && user.isLogin) {
      const payload = {
        action: 'addAudioParticipant',
        team_id: String(teamId),
        kind: 'audio',
        participant: user.email,
        name: user.nickname, // Recoil에서 가져온 닉네임
        profilePicture: user.profileImage, // Recoil에서 가져온 프로필 이미지
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 랜덤 색상 생성
      };
      console.log('Adding audio participant:', payload);
      sendMessage(JSON.stringify(payload));

      return () => {
        const payload = {
          action: 'removeAudioParticipant',
          team_id: String(teamId),
          kind: 'audio',
          participant: user.email,
        };
        console.log('Removing audio participant:', payload);
        sendMessage(JSON.stringify(payload));
      };
    }
  }, [isConnected, sendMessage, teamId, user]);  

  return (
    <div className="audio-chat p-4">
      <div className="participants">
        {participants.map((participant, index) => (
          <div key={index} className="participant">
            <img src={participant.profilePicture} alt={participant.name} className="profile-pic" />
            <p>{participant.name}</p>
            <input
              className='volume-slider'
              type="range"
              min="0"
              max="100"
              value={participant.volume}
              onChange={(event) => handleVolumeChange(index, event)}
            />
          </div>
        ))}
      </div>

      <audio ref={remoteAudioRef} style={{ display: 'none' }} />

      <button onClick={onClose} className="end-call-button">
        <MdCallEnd size={24} />
      </button>
    </div>
  );
};

export default AudioChat;
