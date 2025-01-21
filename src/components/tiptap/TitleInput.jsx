import React from "react";
import "./TitleInput.css";

const TitleInput = ({ title, onTitleChange }) => {
  const handleChange = (e) => {
    onTitleChange(e.target.value);
  };

  return (
    <div className="title-input-container">
      <input
        type="text"
        value={title}
        onChange={handleChange}
        placeholder="Enter title"
        className="title-input"
      />
    </div>
  );
};

export default TitleInput;