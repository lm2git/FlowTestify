import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';  // Importa il contesto
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';



const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;