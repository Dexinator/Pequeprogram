import React, { useState, useEffect } from 'react';
import { UserService } from '../services/user.service';

const userService = new UserService();

// Mapeo de nombres de roles para mostrar
const roleDisplayNames = {
  'superadmin': 'Super Admin',
  'admin': 'Administrador',
  'gerente': 'Gerente de Tienda',
  'valuador': 'Valuador',
  'vendedor': 'Vendedor'
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await userService.getRoles();
      // Filtrar roles según la jerarquía (no mostrar superadmin como opción)
      const filteredRoles = data.filter(role => role.name !== 'superadmin');
      setRoles(filteredRoles);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Si no se proporciona contraseña, no la incluimos en la actualización
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.updateUser(editingUser.id, updateData);
      } else {
        await userService.createUser(formData);
      }
      setShowForm(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setError(error.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // No mostramos la contraseña
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      is_active: user.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await userService.deleteUser(userId);
        loadUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        setError('Error al eliminar el usuario');
      }
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.updateUser(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      setError('Error al cambiar el estado del usuario');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role_id: '',
      is_active: true
    });
    setEditingUser(null);
  };

  const getRoleDisplayName = (roleName) => {
    return roleDisplayNames[roleName] || roleName;
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'gerente':
        return 'bg-green-100 text-green-800';
      case 'valuador':
        return 'bg-yellow-100 text-yellow-800';
      case 'vendedor':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right">×</button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {editingUser && '(dejar vacío para no cambiar)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required={!editingUser}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {getRoleDisplayName(role.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Usuario activo</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role?.name)}`}>
                    {getRoleDisplayName(user.role?.name)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  {user.role?.name !== 'superadmin' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}