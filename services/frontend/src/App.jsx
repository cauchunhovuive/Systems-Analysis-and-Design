import React from 'react';
import { AuthProvider } from './AuthProvider';
import AppRoutes from './Routes';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast'; // Import Toaster

function App() {
  return (
    <AuthProvider>
      {/* Cấu hình vị trí hiện thông báo ở góc trên bên phải */}
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;