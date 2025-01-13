import React, { useRef } from "react";
import Tiptap from "../../components/Tiptap/Tiptap"
import NoteHeader from "../../components/common/NoteHeader";
import { saveNote } from "../../service/NoteService";

const TeamNote = () => {
  const participants = [
    { name: "Alice", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
    { name: "Bob", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
    { name: "Charlie", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
  ];
  
  const tiptapRef = useRef(null);

    const handleBack = () => {
    console.log("Back button clicked!");
  };

  const handleShare = () => {
    console.log("Share button clicked!");
  };

  const handleChat = () => {
    console.log("Chat button clicked!");
  };

  const handleSave = async (content) => {
    const note = {
      team_id: "1",
      note: JSON.stringify(content),
      created_at: new Date().toISOString(),
    }

    try {
      const response = await saveNote(note);
    } catch (error) {
      console.error(error);
    }

  };

  return (
    <div className="TeamNote">
      <NoteHeader 
        participants={participants} 
        onBack={handleBack}
        onShare={handleShare} 
        onChat={handleChat}
        onMenu={() => console.log("Menu button clicked!")}
        onSave={() => tiptapRef.current.handleSave()}
      />

      <main>
        <Tiptap ref={tiptapRef} onSave={handleSave} team_id={"1"} />
      </main>

    </div>
  );
};

export default TeamNote;
