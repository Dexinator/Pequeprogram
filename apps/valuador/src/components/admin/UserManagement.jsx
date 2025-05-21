import React, { useState, useEffect } from 'react';
import { UserService } from '../../services/user.service';

/**
 * Componente para la gestión de usuarios
 * Permite listar, crear, editar y eliminar usuarios
 */
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userService, setUserService] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role_id: 3, // Por defecto, rol de valuador (ID 3)
    is_active: true
  });
  const [roles, setRoles] = useState([]);

  // Inicializar el servicio de usuarios solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const service = new UserService();
      setUserService(service);

      // Cargar usuarios y roles al inicializar
      const initialize = async () => {
        await loadUsers(service);
        await loadRoles(service);
      };

      initialize();
    }
  }, []);

  // Cargar roles
  const loadRoles = async (service) => {
    try {
      const rolesList = await service.getRoles();
      setRoles(rolesList);

      // Si hay roles, establecer el rol por defecto al primero que no sea admin
      if (rolesList.length > 0) {
        const defaultRole = rolesList.find(role => role.name !== 'admin') || rolesList[0];
        setFormData(prev => ({
          ...prev,
          role_id: defaultRole.id
        }));
      }
    } catch (err) {
      console.error('Error al cargar roles:', err);
      setError('Error al cargar la lista de roles');
    }
  };

  // Cargar la lista de usuarios
  const loadUsers = async (service) => {
    setIsLoading(true);
    setError(null);

    try {
      const userList = await service.getUsers();
      setUsers(userList);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Mostrar formulario de creación
  const handleShowCreateForm = () => {
    // Obtener el rol por defecto (el primero que no sea admin)
    const defaultRoleId = roles.length > 0
      ? (roles.find(role => role.name !== 'admin')?.id || roles[0].id)
      : 3; // Por defecto, rol de valuador (ID 3)

    setFormData({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      role_id: defaultRoleId,
      is_active: true
    });
    setEditingUser(null);
    setShowCreateForm(true);
  };

  // Mostrar formulario de edición
  const handleShowEditForm = (user) => {
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      is_active: user.is_active
    });
    setEditingUser(user);
    setShowCreateForm(true);
  };

  // Cancelar formulario
  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingUser(null);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userService) {
      setError('El servicio de usuarios no está disponible');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const userData = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role_id: formData.role_id,
          is_active: formData.is_active
        };

        // Solo incluir contraseña si se ha proporcionado una nueva
        if (formData.password) {
          userData.password = formData.password;
        }

        const updatedUser = await userService.updateUser(editingUser.id, userData);
        if (updatedUser) {
          setSuccess(`Usuario ${userData.username} actualizado correctamente`);
        } else {
          setError('Error al actualizar usuario');
        }
      } else {
        // Crear nuevo usuario
        const userData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role_id: formData.role_id,
          is_active: formData.is_active
        };

        const newUser = await userService.createUser(userData);
        if (newUser) {
          setSuccess(`Usuario ${userData.username} creado correctamente`);
        } else {
          setError('Error al crear usuario');
        }
      }

      // Recargar lista de usuarios
      await loadUsers(userService);

      // Cerrar formulario
      setShowCreateForm(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.username}?`)) {
      return;
    }

    if (!userService) {
      setError('El servicio de usuarios no está disponible');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.deleteUser(user.id);
      setSuccess(`Usuario ${user.username} eliminado correctamente`);

      // Recargar lista de usuarios
      await loadUsers(userService);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-base">Gestión de Usuarios</h2>
        <button
          onClick={handleShowCreateForm}
          className="px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
          disabled={isLoading}
        >
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rosa/10 border border-rosa rounded-md text-rosa">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-verde-claro/10 border border-verde-claro rounded-md text-verde-claro">
          <p>{success}</p>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-background-alt p-6 rounded-lg shadow-md border border-border">
          <h3 className="text-xl font-bold mb-4">
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-text-base">
                Nombre
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-border rounded-md bg-background"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-text-base">
                Apellido
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-border rounded-md bg-background"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-base">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-border rounded-md bg-background"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-base">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-border rounded-md bg-background"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-base">
                Contraseña {editingUser && '(dejar en blanco para mantener la actual)'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-border rounded-md bg-background"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-text-base">
                Rol
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-border rounded-md bg-background"
                disabled={isLoading}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description || ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-azul-claro border-border rounded"
                disabled={isLoading}
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-text-base">
                Usuario activo
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 border border-border rounded-md hover:bg-background-alt transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-background-alt rounded-lg shadow-md overflow-hidden border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-alt">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {isLoading && !users.length ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-text-muted">
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-text-muted">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-base">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-base">{user.first_name} {user.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-base">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role?.name === 'admin' ? 'bg-rosa/10 text-rosa' : 'bg-azul-claro/10 text-azul-claro'
                    }`}>
                      {user.role?.name || 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-verde-claro/10 text-verde-claro' : 'bg-rosa/10 text-rosa'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleShowEditForm(user)}
                      className="text-azul-claro hover:text-azul-profundo mr-3"
                      disabled={isLoading}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-rosa hover:text-rosa/80"
                      disabled={isLoading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
