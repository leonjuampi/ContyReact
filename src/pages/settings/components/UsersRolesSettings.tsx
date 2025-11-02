
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  assignedPos: string[];
}

interface Role {
  id: string;
  name: string;
  permissions: {
    sales: boolean;
    prices: boolean;
    stock: boolean;
    reports: boolean;
    products: boolean;
    customers: boolean;
    settings: boolean;
  };
}

export default function UsersRolesSettings() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      username: 'juan.perez',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-03-15T10:30:00Z',
      assignedPos: ['1', '2']
    },
    {
      id: '2',
      name: 'María García',
      username: 'maria.garcia',
      role: 'vendedor',
      status: 'active',
      lastLogin: '2024-03-15T09:45:00Z',
      assignedPos: ['1']
    },
    {
      id: '3',
      name: 'Carlos López',
      username: 'carlos.lopez',
      role: 'supervisor',
      status: 'inactive',
      lastLogin: '2024-03-10T14:20:00Z',
      assignedPos: ['2']
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrador',
      permissions: {
        sales: true,
        prices: true,
        stock: true,
        reports: true,
        products: true,
        customers: true,
        settings: true
      }
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      permissions: {
        sales: true,
        prices: true,
        stock: true,
        reports: true,
        products: true,
        customers: true,
        settings: false
      }
    },
    {
      id: 'vendedor',
      name: 'Vendedor',
      permissions: {
        sales: true,
        prices: false,
        stock: false,
        reports: false,
        products: false,
        customers: true,
        settings: false
      }
    }
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    role: 'vendedor',
    assignedPos: [] as string[]
  });

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    permissions: {
      sales: false,
      prices: false,
      stock: false,
      reports: false,
      products: false,
      customers: false,
      settings: false
    }
  });

  const pointsOfSale = [
    { id: '1', name: 'Sucursal Centro' },
    { id: '2', name: 'Sucursal Norte' },
    { id: '3', name: 'Tienda Online' }
  ];

  const permissionLabels = {
    sales: 'Ventas',
    prices: 'Precios',
    stock: 'Stock',
    reports: 'Reportes',
    products: 'Productos',
    customers: 'Clientes',
    settings: 'Configuración'
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      username: '',
      role: 'vendedor',
      assignedPos: []
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      username: user.username,
      role: user.role,
      assignedPos: user.assignedPos
    });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(prev => prev.map(user =>
        user.id === editingUser.id
          ? { ...user, ...userFormData }
          : user
      ));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...userFormData,
        status: 'active',
        lastLogin: ''
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowUserModal(false);
  };

  const handleNewRole = () => {
    setEditingRole(null);
    setRoleFormData({
      name: '',
      permissions: {
        sales: false,
        prices: false,
        stock: false,
        reports: false,
        products: false,
        customers: false,
        settings: false
      }
    });
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      permissions: { ...role.permissions }
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(prev => prev.map(role =>
        role.id === editingRole.id
          ? { ...role, ...roleFormData }
          : role
      ));
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...roleFormData
      };
      setRoles(prev => [...prev, newRole]);
    }
    setShowRoleModal(false);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuarios y Roles</h2>
          <p className="text-gray-600 dark:text-gray-400">Administra usuarios y permisos del sistema</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={activeTab === 'users' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </Button>
          <Button
            variant={activeTab === 'roles' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </Button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleCreateUser}>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-user-add-line"></i>
              </div>
              Crear Usuario
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Último Acceso</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                          user.role === 'supervisor' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                          'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        }`}>
                          {roles.find(r => r.id === user.role)?.name || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                            user.status === 'active'
                              ? 'bg-black dark:bg-white'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                              user.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                          </div>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleNewRole}>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-add-line"></i>
              </div>
              Nuevo Rol
            </Button>
          </div>

          <Card>
            <div className="space-y-6">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {users.filter(u => u.role === role.id).length} usuario(s) asignado(s)
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-edit-line"></i>
                      </div>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(role.permissions).map(([permission, enabled]) => (
                      <div
                        key={permission}
                        className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium ${
                          enabled
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <i className={enabled ? 'ri-check-line' : 'ri-close-line'}></i>
                        </div>
                        {permissionLabels[permission as keyof typeof permissionLabels]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="juan.perez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol *
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Puntos de Venta Asignados
                </label>
                <div className="space-y-2">
                  {pointsOfSale.map((pos) => (
                    <label key={pos.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userFormData.assignedPos.includes(pos.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserFormData(prev => ({
                              ...prev,
                              assignedPos: [...prev.assignedPos, pos.id]
                            }));
                          } else {
                            setUserFormData(prev => ({
                              ...prev,
                              assignedPos: prev.assignedPos.filter(id => id !== pos.id)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pos.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveUser}>
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Nombre del rol"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Permisos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissionLabels).map(([permission, label]) => (
                    <div key={permission} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                      <button
                        onClick={() => setRoleFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [permission]: !prev.permissions[permission as keyof typeof prev.permissions]
                          }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                          roleFormData.permissions[permission as keyof typeof roleFormData.permissions]
                            ? 'bg-black dark:bg-white'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                            roleFormData.permissions[permission as keyof typeof roleFormData.permissions] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRoleModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveRole}>
                {editingRole ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
