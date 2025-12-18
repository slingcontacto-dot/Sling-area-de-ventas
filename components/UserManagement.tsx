import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { Users, Plus, Edit2, Trash2, Save, X, Shield, ShieldAlert, Key } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null); // Username of user being edited
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    role: 'employee'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await authService.getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'employee' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user.username);
    setFormData({ ...user });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (username: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) {
      await authService.deleteUser(username);
      loadUsers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (editingUser) {
      // Update existing
      await authService.updateUser(editingUser, formData);
    } else {
      // Add new
      const success = await authService.addUser(formData);
      if (!success) {
        setError('El nombre de usuario ya existe o hubo un error');
        return;
      }
    }

    setIsModalOpen(false);
    loadUsers();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Users size={20} />
            </span>
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-gray-500 mt-1">Administra el acceso y roles del personal</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contraseña</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Cargando usuarios...</td>
                </tr>
            ) : users.map((user) => (
              <tr key={user.username} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'owner' ? <Shield size={12} /> : <ShieldAlert size={12} />}
                    {user.role === 'owner' ? 'Dueño' : 'Empleado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {user.password}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.username)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={!!editingUser} 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${editingUser ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300'}`}
                    placeholder="Nombre"
                  />
                </div>
                {editingUser && <p className="text-xs text-gray-400 mt-1">El nombre de usuario no se puede cambiar.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Contraseña"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'employee'})}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      formData.role === 'employee' 
                        ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldAlert size={18} />
                    <span className="text-sm font-medium">Empleado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'owner'})}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      formData.role === 'owner' 
                        ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Shield size={18} />
                    <span className="text-sm font-medium">Dueño</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    <Save size={16} />
                    Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};