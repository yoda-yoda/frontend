import React from "react";
import "./DropdownCard.css";
import { FaTable, FaImage, FaCode } from "react-icons/fa"; // 아이콘 패키지 임포트

const DropdownCard = ({ commands, position, onCommandClick }) => {
  const getIcon = (label) => {
    switch (label) {
      case "table":
        return <FaTable />;
      case "image":
        return <FaImage />;
      case "code block":
        return <FaCode />;
      default:
        return null;
    }
  };

  return (
    <ul className="dropdown" style={{ left: position.x, top: position.y }}>
      {commands.map((command, index) => (
        <li
          key={index}
          className="dropdown-item"
          onClick={() => onCommandClick(command)}
        >
          {getIcon(command.label)}
          <span className="dropdown-text">{command.label}</span>
        </li>
      ))}
    </ul>
  );
};

export default DropdownCard;