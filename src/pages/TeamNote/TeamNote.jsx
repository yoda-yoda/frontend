import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import Tiptap from "../../components/tiptap/Tiptap";
import NoteHeader from "../../components/common/NoteHeader";
import Sidebar from "../../components/common/Sidebar";
import { saveNote, getNotesByTeamID, updateNoteTitle, getNoteByID } from "../../service/NoteService";
import { noteState } from "../../recoil/noteWebrtcAtoms";
import TitleButtons from "../../components/tiptap/TitleButtons";
import TitleInput from "../../components/tiptap/TitleInput";
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
  const [titles, setTitles] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);

  const yDoc = useRef(new Y.Doc());
  const provider = useRef(null);
  const awareness = useRef(new Awareness(yDoc.current));

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

    if (provider.current) {
      const user = {
        name: peerId,
        email: peerId + "@example.com",
      };
      const userColor = "#" + ((1 << 24) * Math.random() | 0).toString(16); 
      provider.current.awareness.setLocalStateField('user', {
        name: user.name,
        email: user.email,
        color: userColor,
      });
    }

    const yTitle = yDoc.current.getMap("title");
      yTitle.observe(event => {
        console.log("Title changed:", event);
        const newTitle = yTitle.get("currentTitle");
        console.log("New title:", newTitle);
        if (newTitle !== currentTitle) {
          setCurrentTitle(newTitle);
        }
    });

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (provider.current) {
        provider.current.destroy();
      }
      yDoc.current.destroy();
    };
  }, [team_id, setNote]);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const notes = await getNotesByTeamID(team_id);
        setTitles(notes.map(note => ({ id: note.id, title: note.title ?? 'Untitled' })));
      } catch (error) {
        console.error("Error fetching titles:", error);
      }
    };

    fetchTitles();
  }, [team_id]);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTitleClick = async (id) => {
    try {
      const noteData = await getNoteByID(id);
      if (noteData && noteData.note) {
        const parsedNote = JSON.parse(noteData.note);
        setNote(noteData);
        handleTitleChange(noteData.title);
        console.log(note.id);
        tiptapRef.current?.handleGetNote(parsedNote);

      } else {
        setNote({});
      }
    } catch (error) {
      console.error("Error fetching note by title:", error);
    }

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

  const handleSave = async (pmJson) => {
    try {
      const noteToSave = {
        id: note?.id || '',
        team_id: team_id,
        note: JSON.stringify(pmJson),
        title: currentTitle,
        created_at: new Date().toISOString(),
      };
      await saveNote(noteToSave);
      console.log("Note saved:", noteToSave);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleUpdateTitle = async (id, newTitle) => {
    try {
      await updateNoteTitle(id, newTitle);
      const updatedTitles = titles.map(title => (title.id === id ? { ...title, title: newTitle } : title));
      setTitles(updatedTitles);
      console.log("Title updated:", id, "=>", newTitle);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const handleTitleChange = (title) => {
    const yTitle = yDoc.current.getMap("title");
    yTitle.set("currentTitle", title);
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

      <main className="container">
        <TitleButtons titles={titles} onTitleClick={handleTitleClick} onUpdateTitle={handleUpdateTitle} />
        <TitleInput title={currentTitle} onTitleChange={handleTitleChange} />
        {provider.current && awareness.current ? (
          <Tiptap
            ref={tiptapRef}
            onSave={handleSave}
            initialJson={note}
            yDoc={yDoc.current}
            provider={provider}
            awareness={awareness.current}
          />
        ) : (
          <div>Loading...</div>
        )}

      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={handleMenuClick} />
    </div>
  );
};

export default TeamNote;