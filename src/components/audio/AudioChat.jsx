import React, { useState } from 'react';
import { AiOutlineAudio } from 'react-icons/ai';
import { MdCallEnd } from 'react-icons/md';
import './AudioChat.css';

const AudioChat = () => {
  const [participants, setParticipants] = useState([
    { name: 'Alice', profilePic: 'https://octapi.lxzin.com/imageBlockProp/image/202210/11/720/0/6ccc1a45-331e-4222-b812-45276c062151.jpg', volume: 50 },
    { name: 'Bob', profilePic: 'https://octapi.lxzin.com/imageBlockProp/image/202210/11/720/0/6ccc1a45-331e-4222-b812-45276c062151.jpg', volume: 50 },
    { name: 'Charlie', profilePic: 'https://octapi.lxzin.com/imageBlockProp/image/202210/11/720/0/6ccc1a45-331e-4222-b812-45276c062151.jpg', volume: 50 }
  ]); // 예시 참여자 리스트

  const handleVolumeChange = (index, event) => {
    const newVolume = event.target.value;
    setParticipants(prevParticipants => {
      const updatedParticipants = [...prevParticipants];
      updatedParticipants[index].volume = newVolume;
      return updatedParticipants;
    });
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
        <button className="btn">
          <MdCallEnd size={24} />
        </button>
      </div>
    </div>
  );
};

export default AudioChat;