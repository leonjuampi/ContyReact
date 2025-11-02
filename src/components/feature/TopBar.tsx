
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../base/Button';
import { useTheme } from '../../contexts/ThemeContext';

interface TopBarProps {
  onNewSale?: () => void;
  title?: string;
}

export default function TopBar({ onNewSale, title }: TopBarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Función para obtener el título basado en la ruta actual
  const getPageTitle = () => {
    if (title) return title; // Si se pasa un título específico, usarlo
    
    const path = location.pathname;
    const titleMap: { [key: string]: string } = {
      '/': 'Dashboard',
      '/productos': 'Productos',
      '/clientes': 'Clientes',
      '/presupuestos': 'Presupuestos',
      '/ventas': 'Ventas',
      '/stock': 'Stock',
      '/reportes': 'Reportes',
      '/configuracion': 'Configuración',
      '/home': 'Inicio',
      '/login': 'Iniciar Sesión',
    };
    
    return titleMap[path] || 'Dashboard';
  };

  const handleNewSale = () => {
    if (onNewSale) {
      onNewSale();
    } else {
      // Navegar a la página de ventas
      navigate('/ventas');
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    // Simular logout
    console.log('Cerrando sesión...');
    setShowUserMenu(false);
    // Aquí podrías redirigir al login o limpiar el estado de autenticación
  };

  const handleProfile = () => {
    console.log('Abriendo perfil...');
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    console.log('Abriendo configuración...');
    setShowUserMenu(false);
    // Navegar a configuración
    navigate('/configuracion');
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'} text-lg`}></i>
            </div>
          </button>
          
          <Button onClick={handleNewSale} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-add-line text-lg"></i>
            </div>
            Nueva Venta
          </Button>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleUserMenu}
              className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-user-line text-gray-600 dark:text-gray-300"></i>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                {/* Información del usuario */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className="ri-user-fill text-white dark:text-black text-lg"></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Admin Usuario</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@empresa.com</p>
                    </div>
                  </div>
                </div>

                {/* Opciones del menú */}
                <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-3">
                      <i className="ri-user-settings-line"></i>
                    </div>
                    Mi Perfil
                  </button>

                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-3">
                      <i className="ri-settings-3-line"></i>
                    </div>
                    Configuración
                  </button>

                  <button
                    onClick={() => {
                      console.log('Abriendo ayuda...');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-3">
                      <i className="ri-question-line"></i>
                    </div>
                    Ayuda y Soporte
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-3">
                      <i className="ri-logout-box-line"></i>
                    </div>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
