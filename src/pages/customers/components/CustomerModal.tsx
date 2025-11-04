import { useState, useEffect } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import { Customer } from '../../services/customer.api';

// --- 1. IMPORTAR CON LA RUTA ALIAS CORREGIDA ---
// (Usamos @ que apunta a 'src/')
import { PriceList, getPriceLists } from '@/services/priceList.api'; 

interface CustomerModalProps {
  customer?: Customer | null;
  onClose: () => void;
  // --- 2. ACTUALIZAR ONSAVE ---
  // Ahora onSave enviará 'priceListId' (un número)
  onSave: (customer: Omit<Customer, 'id' | 'balance' | 'lastPurchaseAt' | 'priceListName'> & { priceListId: number }) => void;
}

// Mapeo Frontend
const taxConditions = [
  'Consumidor Final',
  'Responsable Inscripto',
  'Monotributista',
  'Exento'
];

// --- 3. ELIMINAR EL ARRAY HARDCODEADO ---
// const priceLists = [ ... ]; // <-- BORRADO

// Mapeo Inverso (Backend -> Frontend)
const taxConditionDisplayMap: Record<string, string> = {
  'RI': 'Responsable Inscripto',
  'CF': 'Consumidor Final',
  'MT': 'Monotributista',
  'EX': 'Exento'
};
// const priceListNameMap: Record<number, string> = { ... }; // <-- BORRADO


export default function CustomerModal({ customer, onClose, onSave }: CustomerModalProps) {
  
  // --- 4. ACTUALIZAR ESTADO DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    name: '',
    document: '', 
    email: '',
    phone: '',
    taxCondition: 'Consumidor Final',
    priceListId: 0, // <-- CAMBIADO: de 'priceList: "General"' a 'priceListId: 0'
    tags: [] as string[],
    address: '',
    notes: '',
    status: 'active' as 'active' | 'blocked'
  });

  // --- 5. AÑADIR ESTADO PARA LAS LISTAS ---
  const [availablePriceLists, setAvailablePriceLists] = useState<PriceList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  // --- 6. AÑADIR USEEFFECT PARA CARGAR LISTAS ---
  useEffect(() => {
    // Cargar listas de precio al abrir el modal
    getPriceLists()
      .then(lists => {
        setAvailablePriceLists(lists);
        if (lists.length > 0 && !customer) {
          // Si es un cliente nuevo, asigna la primera lista por defecto
          setFormData(prev => ({ ...prev, priceListId: lists[0].id }));
        }
      })
      .catch(err => {
        console.error("Error fetching price lists:", err);
        setErrors(prev => ({ ...prev, priceList: 'Error al cargar listas de precio' }));
      })
      .finally(() => {
        setIsLoadingLists(false);
      });
  }, []); // Se ejecuta solo una vez al montar

  // --- 7. ACTUALIZAR USEEFFECT [customer] ---
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        document: customer.taxId, // taxId (API) -> document (Form)
        email: customer.email || '',
        phone: customer.phone || '',
        taxCondition: taxConditionDisplayMap[customer.taxCondition] || 'Consumidor Final', // RI -> Responsable Inscripto
        priceListId: customer.priceListId, // <-- CAMBIADO
        tags: customer.tags || [],
        address: customer.address || '',
        notes: customer.notes || '',
        status: customer.status.toLowerCase() as 'active' | 'blocked' // ACTIVE -> active
      });
    }
  }, [customer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.document.trim()) {
      newErrors.document = 'El CUIT/DNI es obligatorio';
    } else {
      const cleanDoc = formData.document.replace(/[-\s]/g, '');
      if (cleanDoc.length < 8) {
        newErrors.document = 'Formato de documento inválido';
      }
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    // --- 8. AÑADIR VALIDACIÓN PARA PRICELISTID ---
    if (!formData.priceListId || formData.priceListId === 0) {
      newErrors.priceList = 'Debe seleccionar una lista de precios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    // --- 9. ACTUALIZAR HANDLEINPUTCHANGE ---
    // Convertir el ID de la lista a número
    const finalValue = field === 'priceListId' ? Number(value) : value;

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // --- 10. AJUSTAR LLAMADA A ONSAVE ---
      await onSave(formData);
    } catch (error) {
      console.error('Error en handleSubmit (modal)', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content (con overflow) */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Información básica */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Información básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm ${
                      errors.name 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white focus:border-transparent'
                    }`}
                    placeholder="Ingrese el nombre completo"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CUIT/DNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => handleInputChange('document', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm font-mono ${
                      errors.document 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white focus:border-transparent'
                    }`}
                    placeholder="XX-XXXXXXXX-X o XXXXXXXX"
                  />
                  {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm ${
                      errors.email 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white focus:border-transparent'
                    }`}
                    placeholder="email@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm ${
                      errors.phone 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white focus:border-transparent'
                    }`}
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </Card>

            {/* Información fiscal y comercial */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Información fiscal y comercial</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condición IVA
                  </label>
                  <select
                    value={formData.taxCondition}
                    onChange={(e) => handleInputChange('taxCondition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm pr-8"
                  >
                    {taxConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lista de precios <span className="text-red-500">*</span>
                  </label>
                  {/* --- 11. ACTUALIZAR EL SELECT DE LISTA DE PRECIOS --- */}
                  <select
                    value={formData.priceListId}
                    onChange={(e) => handleInputChange('priceListId', e.target.value)}
                    disabled={isLoadingLists}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm pr-8 ${
                      errors.priceList 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white focus:border-transparent'
                    }`}
                  >
                    <option value={0} disabled>
                      {isLoadingLists ? 'Cargando listas...' : 'Seleccionar lista'}
                    </option>
                    {availablePriceLists.map(list => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  {errors.priceList && <p className="text-red-500 text-xs mt-1">{errors.priceList}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">Activo</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="blocked"
                        checked={formData.status === 'blocked'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">Bloqueado</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Etiquetas */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Etiquetas</h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                    placeholder="Agregar etiqueta (Enter para confirmar)"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    <i className="ri-add-line mr-1"></i>
                    Agregar
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Dirección y notas */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Dirección y notas</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                    placeholder="Calle 123, Ciudad, Provincia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm resize-none"
                    placeholder="Información adicional sobre el cliente..."
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Ctrl+S para guardar • Esc para cancelar
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-2"></i>
                  {customer ? 'Actualizar' : 'Crear Cliente'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}