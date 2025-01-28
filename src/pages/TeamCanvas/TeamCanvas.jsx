// TeamCanvas.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import CanvasToolbar from '../../components/canvas/CanvasToolbar';
import './TeamCanvas.css';
import NoteHeader from '../../components/common/NoteHeader';
import CanvasArea from '../../components/canvas/CanvasArea';
import Sidebar from '../../components/common/Sidebar';
import CanvasTabs from '../../components/canvas/CanvasTabs';
import { getCanvasByTeamID, getCanvasByID } from '../../service/CanvasService';

import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/UserAtoms';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { Awareness } from 'y-protocols/awareness';

import { useWebSocket } from '../../context/WebSocketContext';
import { v4 as uuidv4 } from 'uuid';

import LogoutConfirmModal from '../../components/auth/LogoutConfirmModal';

const TeamCanvas = ({
  openLoginModal,
  openLogoutModal,
  openAccountDeleteModal,
  openNicknameModal,
}) => {
  const { teamId } = useParams();
  const peerId = useRef(uuidv4()).current; // peerId를 useRef로 안정적으로 유지
  const [tool, setTool] = useState('pencil');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasAreaRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [image, setImage] = useState(null);
  
  const { sendMessage, isConnected, connectionError, addMessageListener } = useWebSocket();

  const user = useRecoilValue(userState);
  const [participants, setParticipants] = useState([]);

  const yDoc = useRef(new Y.Doc());
  const provider = useRef(null);
  const awareness = useRef(new Awareness(yDoc.current));

  useEffect(() => {
    const roomName = `canvas-${teamId}`;
    if (!roomName || typeof roomName !== 'string' || roomName.trim() === '') {
      console.error('Invalid room name:', roomName);
      return;
    }

    // WebRTC provider 설정
    provider.current = new WebrtcProvider(roomName, yDoc.current, {
      signaling: [`ws://localhost:8082/signaling`],
      awareness: awareness.current,
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:127.0.0.1:3478",
          username: "user",
          credential: "pass",
        },
      ],
    });

    // 사용자 정보 설정
    const user = {
      name: `User ${Math.floor(Math.random() * 100)}`,
      color: "#" + ((1 << 24) * Math.random() | 0).toString(16),
    };

    provider.current.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color
    });

    const initialTabs = async () => {
      try {
        const canvases = await getCanvasByTeamID(teamId);
        const tabsData = canvases.map(canvas => ({
          id: canvas.id,
          title: canvas.title,
          shapes: JSON.parse(canvas.canvas || '[]')
        }));
        setTabs(tabsData);
      } catch (error) {
        console.error('Error fetching canvas data:', error);
      }
    };

    initialTabs();

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (provider.current) {
        provider.current.destroy();
      }
      yDoc.current.destroy();
    };
  }, [teamId]);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const canvases = await getCanvasByTeamID(teamId);
        const tabsData = canvases.map(canvas => ({
          id: canvas.id,
          title: canvas.title ?? 'Untitled',
          shapes: JSON.parse(canvas.canvas || '[]')
        }));
        setTabs(tabsData);
      } catch (error) {
        console.error("Error fetching canvas data:", error);
      }
    };

    fetchTitles();
  }, [teamId]);

  // WebSocket 메시지 처리
  const handleMessage = useCallback((message) => {
    console.log('handleMessage called with:', message);
    if (message.action === 'updateParticipants') {
      if (Array.isArray(message.participants)) {
        console.log('Updating participants:', message.participants);
        setParticipants(message.participants);
      } else {
        console.error("Invalid participants data:", message.participants);
      }
    }
  }, [teamId]);

  useEffect(() => {
    // 메시지 리스너 등록
    const unsubscribe = addMessageListener(handleMessage);
    console.log('Listener registered for Team:', teamId);

    // 초기 참여자 목록 요청
    if (sendMessage) {
      const payload = {
        action: 'getParticipants',
        team_id: teamId,
        kind: 'canvas',
      };
      console.log('Sending getParticipants:', payload);
      sendMessage(JSON.stringify(payload));
    }

    return () => {
      // 컴포넌트 언마운트 시 리스너 해제
      if (unsubscribe) unsubscribe();
      console.log('Listener unregistered for Team:', teamId);
    };
  }, [addMessageListener, teamId, sendMessage, handleMessage]);

  const handleTabClick = async (index) => {
    setActiveTab(index);
    const selectedTab = tabs[index];
    const yShapes = yDoc.current.getArray('shapes');

    if (!selectedTab.id) {
      // 아이디가 없는 경우 빈 캔버스를 출력
      yShapes.delete(0, yShapes.length);
      yShapes.push([]);
      return;
    }

    try {
      const canvasData = await getCanvasByID(selectedTab.id);
      const shapes = JSON.parse(canvasData.canvas || '[]');
      const processedShapes = await Promise.all(shapes.map(async shape => {
        if (shape.tool === 'image' && shape.imageUrl) {
          return new Promise(resolve => {
            const img = new window.Image();
            img.src = shape.imageUrl;
            img.onload = () => {
              resolve({ ...shape, image: img });
            };
          });
        }
        return shape;
      }));
      console.log('Processed shapes:', processedShapes);
      yShapes.delete(0, yShapes.length);
      yShapes.push(processedShapes);
    } catch (error) {
      console.error('Error fetching canvas data:', error);
    }
  };

  const handleZoom = (newScale) => {
    const newCanvasSize = {
      width: window.innerWidth * newScale,
      height: window.innerHeight * newScale,
    };
    setCanvasSize(newCanvasSize);
  };

  const handleSelectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  const handleSave = async () => {
    if (canvasAreaRef.current) {
      const response = await canvasAreaRef.current.saveCanvas();
      console.log('Save response:', response);
      if (response && response.id) {
        setTabs(tabs.map((tab, index) => 
          index === activeTab ? { ...tab, id: response.id } : tab
        ));
      }
    }
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleUpdateTitle = (id, newTitle) => {
    setTabs(tabs.map(tab => (tab.id === id ? { ...tab, title: newTitle } : tab)));
  };

  const handleDeleteTab = (id) => {
    setTabs(tabs.filter(tab => tab.id !== id));
    if (activeTab >= tabs.length - 1) {
      setActiveTab(tabs.length - 2);
    }
  };

  const handleAddTab = () => {
    const newTab = {
      id: ``,
      title: 'Untitled',
      shapes: []
    };
    setTabs([...tabs, newTab]);
    setActiveTab(tabs.length);
    const yShapes = yDoc.current.getArray('shapes');
    yShapes.delete(0, yShapes.length);
    yShapes.push([]);
  };

  const handleImageUpload = (imageData) => {
    console.log('Uploaded image data:', imageData);
    setImage(imageData);
  };

  useEffect(() => {
    if (isConnected && user.isLogin) {
      const payload = {
        action: 'addParticipant',
        team_id: teamId,
        kind: 'canvas',
        participant: user.email,
        name: user.nickname, // Recoil에서 가져온 닉네임
        profilePicture: user.profileImage, // Recoil에서 가져온 프로필 이미지
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 랜덤 색상 생성
      };
      console.log('Adding participant:', payload);
      sendMessage(JSON.stringify(payload));

      return () => {
        const payload = {
          action: 'removeParticipant',
          team_id: teamId,
          kind: 'canvas',
          participant: user.email,
        };
        console.log('Removing participant:', payload);
        sendMessage(JSON.stringify(payload));
      };
    }
  }, [isConnected, sendMessage, teamId, peerId, user]);

  // 하트비트 구현 (30초마다 서버에 신호 전송)
  useEffect(() => {
    let heartbeatInterval;

    if (isConnected) {
      heartbeatInterval = setInterval(() => {
        const heartbeatPayload = { action: 'heartbeat' };
        console.log('Sending heartbeat:', heartbeatPayload);
        sendMessage(JSON.stringify(heartbeatPayload));
      }, 30000); // 30초마다
    }

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [isConnected, sendMessage]);

  return (
    <div className={`TeamCanvas ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {connectionError && <div className="error">{connectionError}</div>}
      <NoteHeader
        participants={participants}
        onBack={() => {}}
        onShare={() => {}}
        onChat={() => {}}
        onMenu={handleMenuClick}
        onSave={handleSave}
        onOpenLoginModal={openLoginModal}
        onOpenLogoutModal={openLogoutModal}
        onOpenAccountDeleteModal={openAccountDeleteModal}
        onOpenNicknameModal={openNicknameModal}
      />
      <CanvasTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabClick={handleTabClick} 
        onUpdateTitle={handleUpdateTitle} 
        onDeleteTab={handleDeleteTab}
        onAddTab={handleAddTab}
      />
      <CanvasToolbar className="CanvasToolbar" onSelectTool={handleSelectTool} onImageUpload={handleImageUpload} />
      <CanvasArea 
        ref={canvasAreaRef} 
        tool={tool} 
        teamId={teamId} 
        yDoc={yDoc.current} 
        provider={provider.current} 
        awareness={awareness.current} 
        onZoom={handleZoom} 
        canvasSize={canvasSize} 
        canvasId={tabs[activeTab]?.id} 
        title={tabs[activeTab]?.title}
        image={image}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default TeamCanvas;
