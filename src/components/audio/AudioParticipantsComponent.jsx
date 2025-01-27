// src/components/AudioParticipantsComponent.js
import React, { useEffect } from 'react';
import { useAudioParticipants } from '../contexts/AudioParticipantsContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const AudioParticipantsComponent = () => {
  const { audioParticipants, addAudioParticipant, removeAudioParticipant } = useAudioParticipants();
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    // 예시: 오디오 참여자 추가
    const newParticipant = {
      team_id: 'team1',
      kind: 'audio',
      participant: 'audioParticipant1',
      name: 'Audio User',
      profilePicture: 'url_to_profile_pic',
      color: '#FF5733',
    };
    addAudioParticipant(newParticipant);

    // 메시지 전송
    sendMessage(JSON.stringify({
      action: 'addAudioParticipant',
      ...newParticipant,
    }));

    // 클린업 함수: 컴포넌트 언마운트 시 참여자 제거
    return () => {
      removeAudioParticipant('audioParticipant1');
      sendMessage(JSON.stringify({
        action: 'removeAudioParticipant',
        participantId: 'audioParticipant1',
      }));
    };
  }, [addAudioParticipant, removeAudioParticipant, sendMessage]);

  return (
    <div>
      <h2>Audio Participants</h2>
      <ul>
        {audioParticipants.map(participant => (
          <li key={participant.id}>
            <img src={participant.profilePicture} alt={participant.name} width="30" />
            {participant.name} - <span style={{ color: participant.color }}>{participant.color}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AudioParticipantsComponent;
