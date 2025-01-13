import React from "react";
import Tiptap from "../../components/Tiptap/Tiptap"
import NoteHeader from "../../components/common/NoteHeader";

const TeamNote = () => {
  const participants = [
    { name: "Alice", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
    { name: "Bob", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
    { name: "Charlie", profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJRVyLbmUUrp61vQ7_fkz35ViGCYwX8iSAZw&s" },
  ];

    const handleBack = () => {
    console.log("Back button clicked!");
  };

  const handleShare = () => {
    console.log("Share button clicked!");
  };

  const handleChat = () => {
    console.log("Chat button clicked!");
  };


  return (
    <div className="TeamNote">
      <NoteHeader 
        participants={participants} 
        onBack={handleBack}
        onShare={handleShare} 
        onChat={handleChat} />
      <header>
        <h1>TeamNote</h1>
      </header>
      <main>
        <Tiptap />
      </main>
      <footer>
        <p>TeamNote - Collaborative Markdown Editor</p>
      </footer>
    </div>
  );
};

export default TeamNote;
