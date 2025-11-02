
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/feature/Sidebar';
import TopBar from '../../components/feature/TopBar';
import MetricCard from '../../components/feature/MetricCard';
import RecentSales from '../../components/feature/RecentSales';
import StockAlerts from '../../components/feature/StockAlerts';
import { useTheme } from '../../contexts/ThemeContext';

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleNewSale = () => {
    navigate('/ventas');
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      
      <div className="ml-64">
        <TopBar 
          onNewSale={handleNewSale}
          title="Dashboard"
        />
        
        <main className="p-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Ventas Totales"
              value="$48,250"
              change="+12.5%"
              changeType="positive"
              icon="ri-money-dollar-circle-line"
              iconColor="text-green-600"
            />
            <MetricCard
              title="Cantidad de Ventas"
              value="156"
              change="+8.2%"
              changeType="positive"
              icon="ri-shopping-cart-line"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Promedio por Venta"
              value="$309.29"
              change="+3.8%"
              changeType="positive"
              icon="ri-bar-chart-line"
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Unidades Vendidas"
              value="1,248"
              change="-2.1%"
              changeType="negative"
              icon="ri-box-3-line"
              iconColor="text-orange-600"
            />
          </div>

          {/* Ventas de los últimos 7 días */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ventas de los últimos 7 días
                </h3>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-black dark:bg-white text-white dark:text-black rounded-md cursor-pointer">
                    7 días
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
                    30 días
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {[65, 85, 72, 95, 88, 92, 78].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-black dark:bg-white rounded-t-md transition-all duration-300 hover:opacity-80"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alertas de Stock */}
          <div className="mb-8">
            <StockAlerts />
          </div>

          {/* Ventas recientes */}
          <div className="mb-8">
            <RecentSales />
          </div>

          {/* Productos más vendidos */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Productos más vendidos
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Smartphone Galaxy S24', sales: 45, revenue: '$13,500' },
                  { name: 'Auriculares Bluetooth', sales: 32, revenue: '$4,800' },
                  { name: 'Tablet Android', sales: 28, revenue: '$8,400' },
                  { name: 'Smartwatch Series 9', sales: 24, revenue: '$7,200' },
                  { name: 'Cargador Inalámbrico', sales: 19, revenue: '$1,900' }
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center text-white dark:text-black text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.sales} unidades
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.revenue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
