// src/contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const connectingRef = useRef(false);

  const messageListenersRef = useRef([]);

  const connect = () => {
    if (socketRef.current || connectingRef.current) {
      console.log('WebSocket already connected or connecting.');
      return;
    }
    connectingRef.current = true;

    console.log('Attempting to connect WebSocket...');
    const socket = new WebSocket('ws://localhost:8082/go/ws');

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      connectingRef.current = false;
      // 큐에 저장된 메시지 전송
      messageQueue.forEach(msg => socket.send(msg));
      setMessageQueue([]);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      socketRef.current = null; // 소켓이 닫히면 참조 해제
      connectingRef.current = false;

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttempts.current) * 1000; // 지수 백오프
        reconnectAttempts.current += 1;
        console.log(`Reconnecting WebSocket... Attempt ${reconnectAttempts.current}`);
        setTimeout(connect, timeout);
      } else {
        setConnectionError('Unable to reconnect to WebSocket server.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionError('WebSocket encountered an error.');
      socket.close();
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
      // 모든 메시지 리스너에 메시지 전달
      messageListenersRef.current.forEach(listener => listener(message));
    };

    socketRef.current = socket;
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []); // 빈 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  const sendMessage = (message) => {
    console.log('sendMessage called with:', message);
    if (isConnected && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      console.log('Message sent:', message);
    } else {
      console.log('WebSocket not connected. Queuing message:', message);
      setMessageQueue(prevQueue => [...prevQueue, message]);
    }
  };

  const addMessageListener = (listener) => {
    messageListenersRef.current.push(listener);
    return () => {
      messageListenersRef.current = messageListenersRef.current.filter(l => l !== listener);
    };
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected, connectionError, addMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
