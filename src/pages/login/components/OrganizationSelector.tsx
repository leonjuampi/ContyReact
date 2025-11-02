
import { useState } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface Organization {
  id: string;
  name: string;
  address: string;
  type: 'store' | 'warehouse' | 'office';
}

interface OrganizationSelectorProps {
  organizations: Organization[];
  onSelect: (organizationId: string) => void;
  loading?: boolean;
}

export default function OrganizationSelector({ organizations, onSelect, loading = false }: OrganizationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  const getTypeIcon = (type: Organization['type']) => {
    switch (type) {
      case 'store':
        return 'ri-store-line';
      case 'warehouse':
        return 'ri-building-line';
      case 'office':
        return 'ri-community-line';
      default:
        return 'ri-building-line';
    }
  };

  const getTypeLabel = (type: Organization['type']) => {
    switch (type) {
      case 'store':
        return 'Tienda';
      case 'warehouse':
        return 'Depósito';
      case 'office':
        return 'Oficina';
      default:
        return 'Sucursal';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-building-line text-xl text-gray-600 dark:text-gray-400"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Seleccionar Organización
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tienes acceso a múltiples organizaciones. Selecciona una para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Buscador */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm"
                placeholder="Buscar organización..."
              />
            </div>

            {/* Lista de organizaciones */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredOrganizations.map((org) => (
                <label
                  key={org.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedId === org.id
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="organization"
                      value={org.id}
                      checked={selectedId === org.id}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="h-4 w-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                    
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <i className={`${getTypeIcon(org.type)} text-gray-600 dark:text-gray-400`}></i>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {org.name}
                          </h3>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            {getTypeLabel(org.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {org.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-8">
                <i className="ri-search-line text-3xl text-gray-400 mb-2"></i>
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron organizaciones que coincidan con tu búsqueda.
                </p>
              </div>
            )}

            {/* Botón continuar */}
            <Button
              type="submit"
              fullWidth
              disabled={!selectedId || loading}
              className="py-3"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Accediendo...</span>
                </div>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
