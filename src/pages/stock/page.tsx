import { useState, useEffect } from 'react';
// import Sidebar from '../../components/feature/Sidebar'; // <--- ELIMINADO
// import TopBar from '../../components/feature/TopBar'; // <--- ELIMINADO
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import OverviewTab from './components/OverviewTab';
import MovementsTab from './components/MovementsTab';
import TransfersTab from './components/TransfersTab';
import InventoryTab from './components/InventoryTab';

const tabs = [
  { id: 'overview', label: 'Visión General', icon: 'ri-dashboard-line' },
  { id: 'movements', label: 'Movimientos', icon: 'ri-exchange-line' },
  { id: 'transfers', label: 'Transferencias', icon: 'ri-truck-line' },
  { id: 'inventory', label: 'Inventario', icon: 'ri-clipboard-line' }
];

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          if (activeTab === 'movements') {
            console.log('Nuevo movimiento');
            // Aquí deberías activar el modal de 'Nuevo Movimiento'
            // que está en MovementsTab.tsx
          }
        }
      } else if (e.key === 't' || e.key === 'T') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          if (activeTab === 'transfers') {
            console.log('Nueva transferencia');
            // Aquí deberías activar el modal de 'Nueva Transferencia'
            // que está en TransfersTab.tsx
          }
        }
      } else if (e.key === 'i' || e.key === 'I') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          if (activeTab === 'inventory') {
            console.log('Iniciar inventario');
            // Aquí deberías llamar a la función que inicia el inventario
            // en InventoryTab.tsx
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'movements':
        return <MovementsTab />;
      case 'transfers':
        return <TransfersTab />;
      case 'inventory':
        return <InventoryTab />;
      default:
        return <OverviewTab />;
    }
  };

  // 3. JSX modificado: Se quita el div wrapper, Sidebar y TopBar.
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Gestión de Stock</h1>
          <p className="text-gray-600 dark:text-gray-400">Control de inventario y movimientos</p>
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-black dark:border-white text-black dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Atajos de teclado */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Atajos: 
          {activeTab === 'movements' && <span className="font-mono"> N Nuevo movimiento</span>}
          {activeTab === 'transfers' && <span className="font-mono"> T Nueva transferencia</span>}
          {activeTab === 'inventory' && <span className="font-mono"> I Iniciar inventario</span>}
        </p>
      </div>
    </div>
  );
}