import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';  // Importa il contesto
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Dashboard from './components/Dashboard/Dashboard'; // Corretto!
import NotFound from './pages/NotFound';

// Configurazione del router
const router = createBrowserRouter(
  [
    { path: "/", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "*", element: <NotFound /> }, // per gestire le route non trovate
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
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
