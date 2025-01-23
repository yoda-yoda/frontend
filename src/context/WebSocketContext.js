// WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  console.log('WebSocketProvider 렌더링됨.');
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const connectingRef = useRef(false); // 연결 중인지 추적

  const connect = () => {
    if (socketRef.current || connectingRef.current) {
      console.log('WebSocket already connected or connecting.');
      return;
    }
    connectingRef.current = true;

    console.log('Attempting to connect WebSocket...');
    const socket = new WebSocket('ws://localhost:4000/ws');

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
      // 수신된 메시지 처리 로직 추가
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

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected, connectionError }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
