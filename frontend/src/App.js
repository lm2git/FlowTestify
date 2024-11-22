import React from 'react';
import AppRoutes from './Routes';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <div>
      <Navbar />
      <AppRoutes />
    </div>
  );
};

export default App;
