
import Card from '../base/Card';
import Button from '../base/Button';

interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  category: string;
}

const lowStockItems: StockItem[] = [
  { id: '1', name: 'Smartphone Galaxy S24', currentStock: 3, minStock: 10, category: 'Electrónicos' },
  { id: '2', name: 'Auriculares Bluetooth', currentStock: 1, minStock: 15, category: 'Accesorios' },
  { id: '3', name: 'Cargador USB-C', currentStock: 5, minStock: 20, category: 'Accesorios' },
  { id: '4', name: 'Tablet Android', currentStock: 2, minStock: 8, category: 'Electrónicos' },
];

export default function StockAlerts() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-alert-line text-red-500 text-lg"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alertas de Stock
          </h3>
        </div>
        <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
          {lowStockItems.length} productos
        </span>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.category} • Stock mínimo: {item.minStock}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {item.currentStock} unidades
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  disponibles
                </p>
              </div>
              <Button variant="outline" size="sm">
                <div className="w-4 h-4 flex items-center justify-center mr-1">
                  <i className="ri-add-line"></i>
                </div>
                Reponer
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" fullWidth>
          Ver todos los productos con stock bajo
        </Button>
      </div>
    </Card>
  );
}
