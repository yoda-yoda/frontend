import React, { useState } from "react";
import Modal from "react-modal";
import "./TitleButtons.css";

const TitleButtons = ({ titles, onTitleClick, onUpdateTitle }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const openModal = (title) => {
    setSelectedTitle(title);
    setNewTitle(title);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleUpdateTitle = () => {
    onUpdateTitle(selectedTitle, newTitle);
    closeModal();
  };

  return (
    <div className="title-buttons-container">
      {titles.map(title => (
        <button
          key={title}
          className="title-button"
          onClick={() => onTitleClick(title)}
          onDoubleClick={() => openModal(title)}
        >
          {title}
        </button>
      ))}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Update Title"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Update Title</h2>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={handleUpdateTitle}>Update</button>
        <button onClick={closeModal}>Cancel</button>
      </Modal>
    </div>
  );
};

export default TitleButtons;