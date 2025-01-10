import React from "react";
import Tiptap from "../../components/Tiptap/Tiptap"

const TeamNote = () => {
  return (
    <div className="TeamNote">
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
