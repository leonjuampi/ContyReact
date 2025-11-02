
import { useState } from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface SidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line', path: '/' },
  { id: 'sales', label: 'Ventas', icon: 'ri-shopping-cart-line', path: '/ventas' },
  { id: 'products', label: 'Productos', icon: 'ri-box-3-line', path: '/productos' },
  { id: 'customers', label: 'Clientes', icon: 'ri-user-line', path: '/clientes' },
  { id: 'quotes', label: 'Presupuestos', icon: 'ri-file-text-line', path: '/presupuestos' },
  { id: 'stock', label: 'Stock', icon: 'ri-store-line', path: '/stock' },
  { id: 'reports', label: 'Reportes', icon: 'ri-bar-chart-line', path: '/reportes' },
  { id: 'settings', label: 'Configuración', icon: 'ri-settings-line', path: '/configuracion' },
];

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const handleNavigation = (item: SidebarItem) => {
    onItemClick(item.id);
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(item.path);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-black dark:text-white" style={{ fontFamily: '"Pacifico", serif' }}>
            Conty
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sistema de gestión</p>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 cursor-pointer group ${
                    activeItem === item.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className={`${item.icon} text-lg`}></i>
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
