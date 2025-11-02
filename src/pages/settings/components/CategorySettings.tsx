
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  productsCount: number;
  status: 'active' | 'inactive';
}

export default function CategorySettings() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Electrónicos', parentId: null, order: 1, productsCount: 45, status: 'active' },
    { id: '2', name: 'Smartphones', parentId: '1', order: 1, productsCount: 23, status: 'active' },
    { id: '3', name: 'Laptops', parentId: '1', order: 2, productsCount: 15, status: 'active' },
    { id: '4', name: 'Accesorios', parentId: '1', order: 3, productsCount: 7, status: 'active' },
    { id: '5', name: 'Ropa', parentId: null, order: 2, productsCount: 128, status: 'active' },
    { id: '6', name: 'Camisas', parentId: '5', order: 1, productsCount: 34, status: 'active' },
    { id: '7', name: 'Pantalones', parentId: '5', order: 2, productsCount: 28, status: 'active' },
    { id: '8', name: 'Zapatos', parentId: '5', order: 3, productsCount: 66, status: 'active' },
    { id: '9', name: 'Hogar', parentId: null, order: 3, productsCount: 82, status: 'active' },
    { id: '10', name: 'Muebles', parentId: '9', order: 1, productsCount: 45, status: 'active' },
    { id: '11', name: 'Decoración', parentId: '9', order: 2, productsCount: 37, status: 'active' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
  });

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getRootCategories = () => {
    return categories.filter(cat => !cat.parentId).sort((a, b) => a.order - b.order);
  };

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId || '',
    });
    setShowModal(true);
  };

  const handleNew = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      parentId: parentId || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(prev => prev.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: formData.name, parentId: formData.parentId || null }
          : cat
      ));
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        parentId: formData.parentId || null,
        order: categories.filter(c => c.parentId === (formData.parentId || null)).length + 1,
        productsCount: 0,
        status: 'active'
      };
      setCategories(prev => [...prev, newCategory]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id
        ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' }
        : cat
    ));
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      // Reorder logic would go here
      console.log(`Moving ${draggedItem} to position of ${targetId}`);
    }
    setDraggedItem(null);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Categorías</h2>
          <p className="text-gray-600 dark:text-gray-400">Organiza tus productos en categorías jerárquicas</p>
        </div>
        <Button onClick={() => handleNew()}>
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          {getRootCategories().map((rootCategory) => (
            <div key={rootCategory.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              {/* Root Category */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, rootCategory.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, rootCategory.id)}
                className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg cursor-move ${
                  draggedItem === rootCategory.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                    <i className="ri-drag-move-line"></i>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{rootCategory.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {rootCategory.productsCount} productos
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleNew(rootCategory.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    title="Agregar subcategoría"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-add-line"></i>
                    </div>
                  </button>
                  <button
                    onClick={() => handleEdit(rootCategory)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    title="Editar"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-edit-line"></i>
                    </div>
                  </button>
                  <button
                    onClick={() => toggleStatus(rootCategory.id)}
                    className={`p-2 cursor-pointer ${
                      rootCategory.status === 'active'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title={rootCategory.status === 'active' ? 'Desactivar' : 'Activar'}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={rootCategory.status === 'active' ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                    </div>
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                {getSubCategories(rootCategory.id).map((subCategory, index) => (
                  <div
                    key={subCategory.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, subCategory.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, subCategory.id)}
                    className={`flex items-center justify-between p-4 pl-12 cursor-move ${
                      index !== getSubCategories(rootCategory.id).length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    } ${draggedItem === subCategory.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                        <i className="ri-drag-move-line"></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 dark:text-white">{subCategory.name}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                            {subCategory.productsCount} productos
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(subCategory)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-edit-line"></i>
                        </div>
                      </button>
                      <button
                        onClick={() => toggleStatus(subCategory.id)}
                        className={`p-2 cursor-pointer ${
                          subCategory.status === 'active'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={subCategory.status === 'active' ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-check-line"></i>
              </div>
              <span className="text-sm">Configuración guardada</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-error-warning-line"></i>
              </div>
              <span className="text-sm">Error al guardar</span>
            </div>
          )}
        </div>

        <Button onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-loader-4-line animate-spin"></i>
              </div>
              Guardando...
            </>
          ) : (
            <>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-save-line"></i>
              </div>
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
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
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría Padre
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  <option value="">Sin categoría padre (Raíz)</option>
                  {getRootCategories().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                {editingCategory ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
