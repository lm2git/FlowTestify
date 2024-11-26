import React from 'react';
import logo from '../../assets/images/title-optimized.png';
import './Header.css';
import '../../styles/Dashboard.css';

const Header = ({ onLogout }) => {
  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="dashboard-logo" />
      </div>
      <div className="profile-actions">
        <button onClick={() => alert('Profilo')} className="profile-button">Profilo</button>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;
