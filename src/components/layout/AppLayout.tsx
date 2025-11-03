import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../feature/Sidebar';
import TopBar from '../feature/TopBar';

export default function AppLayout() {
  const location = useLocation();
  
  // Lógica simple para determinar el item activo basado en la ruta
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    // Extrae la primera parte de la ruta (ej. /productos)
    return path.split('/')[1] || 'dashboard';
  };

  const [activeItem, setActiveItem] = useState(getActiveItem());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar 
        activeItem={activeItem} 
        onItemClick={(id) => setActiveItem(id)} 
      />
      <div className="ml-64">
        {/* Pasamos el control del DarkMode al TopBar */}
        <TopBar /> 
        <main> {/* <-- ¡AQUÍ! Quita el className="p-6" */}
          <Outlet /> {/* <-- Aquí se renderizará cada página (Dashboard, Productos, etc.) */}
        </main>
      </div>
    </div>
  );
}