import React, { useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ isExpanded, setIsExpanded, onAddTest }) => {
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }

    // Cleanup: rimuove la classe quando il componente si smonta
    return () => {
      document.body.classList.remove('sidebar-expanded');
    };
  }, [isExpanded]);

  return (
    <aside
      className={`dashboard-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
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
