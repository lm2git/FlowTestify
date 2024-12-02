import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isExpanded, setIsExpanded, onAddTest }) => {
  return (
    <aside
      className={`dashboard-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <ul className="menu-list">
        <li className="menu-item" onClick={onAddTest}>
          <span className="menu-icon">➕</span>
          {isExpanded && <span className="menu-text">Aggiungi Test</span>}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
