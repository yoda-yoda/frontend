import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CanvasToolbar from '../../components/canvas/CanvasToolbar';
import './TeamCanvas.css';
import NoteHeader from '../../components/common/NoteHeader';
import CanvasArea from '../../components/canvas/CanvasArea';
import Sidebar from '../../components/common/Sidebar';
import CanvasTabs from '../../components/canvas/CanvasTabs';
import { getCanvasByTeamID } from '../../service/CanvasService';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { Awareness } from 'y-protocols/awareness';

const TeamCanvas = () => {
  const { teamId } = useParams();
  const [tool, setTool] = useState('pencil');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasAreaRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

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
      signaling: [`ws://localhost:4444`],
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

    // 랜덤 사용자 정보 생성
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
        const canvasData = await getCanvasByTeamID(teamId);
        const shapes = JSON.parse(canvasData.canvas || '[]');
        const yShapes = yDoc.current.getArray('shapes');
        yShapes.push([shapes]);
        setTabs([{ title: 'Current Canvas', shapes }]); // 초기 탭 설정
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

  const handleTabClick = (index) => {
    // setActiveTab(index);
    // const selectedShapes = tabs[index].shapes;
    // const yShapes = yDoc.current.getArray('shapes');
    // yShapes.delete(0, yShapes.length);
    // yShapes.push(selectedShapes);
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

  const handleSave = () => {
    if (canvasAreaRef.current) {
      canvasAreaRef.current.saveCanvas();
    }
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`TeamCanvas ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <NoteHeader onBack={() => {}} onShare={() => {}} onChat={() => {}} onMenu={handleMenuClick} onSave={handleSave} />
      <CanvasTabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
      <CanvasToolbar className="CanvasToolbar" onSelectTool={handleSelectTool} />
      <CanvasArea ref={canvasAreaRef} tool={tool} teamId={teamId} yDoc={yDoc.current} provider={provider.current} awareness={awareness.current} onZoom={handleZoom} canvasSize={canvasSize} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default TeamCanvas;