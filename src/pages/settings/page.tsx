import { useState, useEffect } from 'react';
// import Sidebar from '../../components/feature/Sidebar'; // <--- ELIMINADO
// import TopBar from '../../components/feature/TopBar'; // <--- ELIMINADO
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import CompanySettings from './components/CompanySettings';
import PointOfSaleSettings from './components/PointOfSaleSettings';
import TaxSettings from './components/TaxSettings';
import NumberingSettings from './components/NumberingSettings';
import PriceListSettings from './components/PriceListSettings';
import CategorySettings from './components/CategorySettings';
import PaymentMethodSettings from './components/PaymentMethodSettings';
import UsersRolesSettings from './components/UsersRolesSettings';
import NotificationSettings from './components/NotificationSettings';
import IntegrationSettings from './components/IntegrationSettings';
import SecuritySettings from './components/SecuritySettings';
import BackupExportSettings from './components/BackupExportSettings';

interface SettingsSection {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

const settingsSections: SettingsSection[] = [
  // ... (tu array de secciones no cambia)
  { id: 'company', label: 'Empresa', icon: 'ri-building-line', component: CompanySettings },
  { id: 'pos', label: 'Puntos de Venta', icon: 'ri-store-line', component: PointOfSaleSettings },
  { id: 'taxes', label: 'Impuestos', icon: 'ri-receipt-line', component: TaxSettings },
  { id: 'numbering', label: 'Numeración', icon: 'ri-hashtag', component: NumberingSettings },
  { id: 'pricelists', label: 'Listas de Precios', icon: 'ri-price-tag-3-line', component: PriceListSettings },
  { id: 'categories', label: 'Categorías', icon: 'ri-folder-line', component: CategorySettings },
  { id: 'payments', label: 'Medios de Pago', icon: 'ri-bank-card-line', component: PaymentMethodSettings },
  { id: 'users', label: 'Usuarios & Roles', icon: 'ri-user-settings-line', component: UsersRolesSettings },
  { id: 'notifications', label: 'Notificaciones', icon: 'ri-notification-line', component: NotificationSettings },
  { id: 'integrations', label: 'Integraciones', icon: 'ri-links-line', component: IntegrationSettings },
  { id: 'security', label: 'Seguridad', icon: 'ri-shield-line', component: SecuritySettings },
  { id: 'backup', label: 'Backup & Export', icon: 'ri-download-line', component: BackupExportSettings },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('company');
  // const [isDarkMode, setIsDarkMode] = useState(false); // <--- ELIMINADO
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const ActiveComponent = settingsSections.find(s => s.id === activeSection)?.component || CompanySettings;

  // 3. JSX modificado: Se quita el div wrapper, Sidebar, TopBar y se usa <>.
  //    El layout de esta página (el <div className="flex">) se mantiene intacto.
  return (
    <>
      <div className="flex">
        {/* Sub-sidebar for settings sections */}
        {/* Este 'fixed left-64' se alineará con el Sidebar principal (que mide w-64) */}
        <div className="fixed left-64 top-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 pt-20">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza tu sistema</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-1">
              {settingsSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-200 cursor-pointer ${
                      activeSection === section.id
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center mr-3">
                      <i className={`${section.icon} text-lg`}></i>
                    </div>
                    <span className="font-medium text-sm">{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content area */}
        {/* Este 'ml-72' es correcto, porque es el margen para el sub-sidebar (w-72) */}
        <div className="ml-72 flex-1 p-6">
          <div className="max-w-4xl">
            <ActiveComponent />
          </div>
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center">
            <div className="w-5 h-5 flex items-center justify-center mr-2">
              <i className="ri-alert-line text-yellow-600 dark:text-yellow-400"></i>
            </div>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Tienes cambios sin guardar
            </span>
          </div>
        </div>
      )}
    </>
  );
}