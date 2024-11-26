import React, { useState } from 'react'; 
import './Sidebar.css';

const Sidebar = ({ isExpanded, setIsExpanded, onAddTest }) => {
  return (
    <aside
      className={`dashboard-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)} // Usa il setter per aggiornare lo stato
      onMouseLeave={() => setIsExpanded(false)} // Usa il setter per aggiornare lo stato
    >
      <ul className="menu-list">
        <li className="menu-item" onClick={onAddTest}>
          <span className="menu-icon">➕</span>
          {isExpanded && <span>Aggiungi Test</span>}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;