import React from 'react';
import './CanvasTabs.css';

const CanvasTabs = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="canvas-tabs">
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`canvas-tab ${activeTab === index ? 'active' : ''}`}
          onClick={() => onTabClick(index)}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default CanvasTabs;