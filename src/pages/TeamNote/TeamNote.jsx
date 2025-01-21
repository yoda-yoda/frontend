import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import Tiptap from "../../components/tiptap/Tiptap";
import NoteHeader from "../../components/common/NoteHeader";
import Sidebar from "../../components/common/Sidebar";
import { saveNote, getNote } from "../../service/NoteService";
import { noteState } from "../../recoil/noteWebrtcAtoms";
import "./TeamNote.css";
import { v4 as uuidv4 } from "uuid";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { Awareness } from "y-protocols/awareness";

const TeamNote = () => {
  const { team_id } = useParams();
  const peerId = uuidv4();

  const [note, setNote] = useRecoilState(noteState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Yjs 문서 & WebrtcProvider 레퍼런스
  const yDoc = useRef(new Y.Doc());
  const provider = useRef(null);
  const awareness = useRef(new Awareness(yDoc.current));

  // Tiptap 컴포넌트 접근
  const tiptapRef = useRef(null);

  const participants = [
    { name: "Alice", profilePicture: "...", color: "#918A70" },
    { name: "Bob", profilePicture: "...", color: "#9AE6E8" },
    { name: "Charlie", profilePicture: "...", color: "#C51790" },
  ];

  useEffect(() => {
    const roomName = `note-${team_id}`;
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

    // DB에서 문서 불러오기
    const fetchNote = async () => {
      try {
        const noteData = await getNote(team_id);
        if (noteData && noteData.note) {
          const parsedNote = JSON.parse(noteData.note);

          // 로컬 상태에 저장(굳이 안 해도 되지만, 표시용이라면)
          setNote(parsedNote);
          console.log("Note fetched:", parsedNote);

          const yXmlFragment = yDoc.current.getXmlFragment("prosemirror");
          yXmlFragment.delete(0, yXmlFragment.length);
          yXmlFragment.insert(0, parsedNote); 
          console.log('Yjs document updated with fetched note');
        } else {
          // 문서가 없으면 빈 객체
          setNote({});
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };

    // 처음 렌더링 시에만 불러오기
    fetchNote();

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (provider.current) {
        provider.current.destroy();
      }
      yDoc.current.destroy();
    };
  }, [team_id, setNote]);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    console.log("Back button clicked!");
  };

  const handleShare = () => {
    console.log("Share button clicked!");
  };

  const handleChat = () => {
    console.log("Chat button clicked!");
  };

  // Tiptap에서 “저장” 버튼을 누르면 이 함수가 호출되어
  // ProseMirror JSON => DB에 저장
  const handleSave = async (pmJson) => {
    try {
      const noteToSave = {
        team_id: team_id,
        note: JSON.stringify(pmJson),
        created_at: new Date().toISOString(),
      };
      await saveNote(noteToSave);
      console.log("Note saved:", noteToSave);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className={`team-note ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <NoteHeader
        participants={participants}
        onBack={handleBack}
        onShare={handleShare}
        onChat={handleChat}
        onMenu={handleMenuClick}
        onSave={() => tiptapRef.current?.handleSave()}
      />

      <main>
        <Tiptap
          ref={tiptapRef}
          onSave={handleSave}
          // DB에서 가져온 초기 ProseMirror JSON
          initialJson={note}
          // 실시간 협업용 Y.Doc
          yDoc={yDoc.current}
        />
      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default TeamNote;