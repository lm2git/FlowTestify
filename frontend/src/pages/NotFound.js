import React from 'react';
import '../styles/NotFound.css'; // Importa il CSS specifico per NotFound


const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go to Homepage</a> {/* Link per tornare alla homepage */}
    </div>
  );
};

export default NotFound;