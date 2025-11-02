
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface PointOfSale {
  id: string;
  name: string;
  address: string;
  channel: 'local' | 'ecommerce';
  printer: string;
  status: 'active' | 'inactive';
}

export default function PointOfSaleSettings() {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([
    {
      id: '1',
      name: 'Sucursal Centro',
      address: 'Av. Corrientes 1234, CABA',
      channel: 'local',
      printer: 'Ticket POS-001',
      status: 'active'
    },
    {
      id: '2',
      name: 'Tienda Online',
      address: 'Virtual',
      channel: 'ecommerce',
      printer: 'Sin impresora',
      status: 'active'
    },
    {
      id: '3',
      name: 'Sucursal Norte',
      address: 'Av. Cabildo 5678, CABA',
      channel: 'local',
      printer: 'Ticket POS-002',
      status: 'inactive'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPos, setEditingPos] = useState<PointOfSale | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    channel: 'local' as 'local' | 'ecommerce',
    printer: '',
  });

  const handleEdit = (pos: PointOfSale) => {
    setEditingPos(pos);
    setFormData({
      name: pos.name,
      address: pos.address,
      channel: pos.channel,
      printer: pos.printer,
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingPos(null);
    setFormData({
      name: '',
      address: '',
      channel: 'local',
      printer: '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingPos) {
      setPointsOfSale(prev => prev.map(pos => 
        pos.id === editingPos.id 
          ? { ...pos, ...formData }
          : pos
      ));
    } else {
      const newPos: PointOfSale = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setPointsOfSale(prev => [...prev, newPos]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    setPointsOfSale(prev => prev.map(pos =>
      pos.id === id
        ? { ...pos, status: pos.status === 'active' ? 'inactive' : 'active' }
        : pos
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Puntos de Venta</h2>
          <p className="text-gray-600 dark:text-gray-400">Administra tus sucursales y canales de venta</p>
        </div>
        <Button onClick={handleNew}>
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          Nuevo Punto de Venta
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Dirección</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Canal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Impresora</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pointsOfSale.map((pos) => (
                <tr key={pos.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{pos.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{pos.address}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pos.channel === 'local'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                    }`}>
                      <div className="w-3 h-3 flex items-center justify-center mr-1">
                        <i className={pos.channel === 'local' ? 'ri-store-line' : 'ri-shopping-cart-line'}></i>
                      </div>
                      {pos.channel === 'local' ? 'Local' : 'E-commerce'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{pos.printer}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(pos.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        pos.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <div className="w-3 h-3 flex items-center justify-center mr-1">
                        <i className={pos.status === 'active' ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'}></i>
                      </div>
                      {pos.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(pos)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-edit-line"></i>
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingPos ? 'Editar Punto de Venta' : 'Nuevo Punto de Venta'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Nombre del punto de venta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Dirección física o 'Virtual'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canal
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value as 'local' | 'ecommerce' }))}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  <option value="local">Local / Físico</option>
                  <option value="ecommerce">E-commerce / Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Impresora/Ticket
                </label>
                <input
                  type="text"
                  value={formData.printer}
                  onChange={(e) => setFormData(prev => ({ ...prev, printer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Configuración de impresora"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingPos ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
