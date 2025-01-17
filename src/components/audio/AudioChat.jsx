import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineAudio } from 'react-icons/ai';
import { MdCallEnd } from 'react-icons/md';
import './AudioChat.css';
import audioWebRTCService from '../../service/AudioWebRTCService';

const AudioChat = ({ onClose }) => {
  const [participants, setParticipants] = useState([
    { name: 'Alice', profilePic: 'https://octapi.lxzin.com/imageBlockProp/image/202210/11/720/0/6ccc1a45-331e-4222-b812-45276c062151.jpg', volume: 50 },
    { name: 'Bob', profilePic: 'https://octapi.lxzin.com/imageBlockProp/image/202210/11/720/0/6ccc1a45-331e-4222-b812-45276c062151.jpg', volume: 50 },
    { name: 'Charlie', profilePic: 'https://octapi.lxzin.com/imageBlockProp/image/202210/11/720/0/6ccc1a45-331e-4222-b812-45276c062151.jpg', volume: 50 }
  ]); // 예시 참여자 리스트

  const remoteAudioRef = useRef(null);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const gainNodesRef = useRef([]);

  useEffect(() => {
    audioWebRTCService.initConnection((remoteStream) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play();

        // 각 트랙에 대해 GainNode를 설정
        remoteStream.getTracks().forEach((track, index) => {
          const source = audioContextRef.current.createMediaStreamSource(new MediaStream([track]));
          const gainNode = audioContextRef.current.createGain();
          source.connect(gainNode).connect(audioContextRef.current.destination);
          gainNodesRef.current[index] = gainNode;
        });
      }
    });

    return () => {
      audioWebRTCService.closeConnection();
      audioContextRef.current.close();
    };
  }, []);

  const handleVolumeChange = (index, event) => {
    const newVolume = event.target.value;
    setParticipants(prevParticipants => {
      const updatedParticipants = [...prevParticipants];
      updatedParticipants[index].volume = newVolume;
      return updatedParticipants;
    });

    if (gainNodesRef.current[index]) {
      gainNodesRef.current[index].gain.value = newVolume / 100;
    }
  };

  return (
    <div className="audio-chat p-4">
      <div className="icon">
        <AiOutlineAudio size={24} />
      </div>
      <div className="participants">
        <ul>
          {participants.map((participant, index) => (
            <li key={index} className="participant">
              <div className="participant-container">
                <img src={participant.profilePic} alt={participant.name} className="profile-pic" />
                <span className="name">{participant.name}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={participant.volume}
                  onChange={(event) => handleVolumeChange(index, event)}
                  className="volume-slider"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="controls">
        <button className="btn" onClick={onClose}>
          <MdCallEnd size={24} />
        </button>
      </div>
    </div>
  );
};

export default AudioChat;