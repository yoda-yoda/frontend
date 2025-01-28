// src/contexts/AudioParticipantsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';

const AudioParticipantsContext = createContext();

export const AudioParticipantsProvider = ({ children }) => {
  const { addMessageListener, sendMessage } = useWebSocket();
  const [audioParticipants, setAudioParticipants] = useState([]);

  useEffect(() => {
    // 메시지 리스너 등록
    const handleAudioParticipantsUpdate = (message) => {
      if (message.action === 'updateAudioParticipants') {
        setAudioParticipants(message.audioParticipants);
      }
    };

    const removeListener = addMessageListener(handleAudioParticipantsUpdate);

    return () => {
      removeListener();
    };
  }, [addMessageListener]);

  const addAudioParticipant = (participant) => {
    const message = JSON.stringify({
      action: 'addAudioParticipant',
      ...participant,
    });
    sendMessage(message);
  };

  const removeAudioParticipant = (participantId) => {
    const message = JSON.stringify({
      action: 'removeAudioParticipant',
      participantId,
    });
    sendMessage(message);
  };

  return (
    <AudioParticipantsContext.Provider value={{ audioParticipants, addAudioParticipant, removeAudioParticipant }}>
      {children}
    </AudioParticipantsContext.Provider>
  );
};

export const useAudioParticipants = () => {
  return useContext(AudioParticipantsContext);
};
