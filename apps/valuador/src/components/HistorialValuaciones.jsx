import React, { useState, useEffect, useMemo } from 'react';
import { ValuationService } from '../services/valuation.service';
import { useAuth, AuthProvider } from '../context/AuthContext';

// Componente de debug
function DebugInfo() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🐛 DebugInfo: Componente montado');
    setMounted(true);
  }, []);
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <h4 className="font-bold">Debug Info:</h4>
      <p>Componente montado: {mounted.toString()}</p>
      <p>Entorno: {typeof window !== 'undefined' ? 'Navegador' : 'Servidor'}</p>
      <p>LocalStorage disponible: {typeof localStorage !== 'undefined' ? 'Sí' : 'No'}</p>
    </div>
  );
}

// Componente interno que usa el contexto
function HistorialValuacionesContent() {
  console.log('🏠 HistorialValuacionesContent: Componente renderizándose...');
  console.log('🏠 Entorno de navegador:', typeof window !== 'undefined');
  
  // DIAGNÓSTICO AUTOMÁTICO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 === DIAGNÓSTICO AUTOMÁTICO ===');
      console.log('🔍 LocalStorage disponible:', typeof localStorage !== 'undefined');
      
      const rawToken = localStorage.getItem('entrepeques_auth_token');
      const rawUser = localStorage.getItem('entrepeques_user');
      
      console.log('🔍 Raw token en localStorage:', rawToken ? `${rawToken.substring(0, 30)}...` : 'NULL');
      console.log('🔍 Raw user en localStorage:', rawUser ? rawUser.substring(0, 100) + '...' : 'NULL');
      
      if (rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          console.log('🔍 Usuario parseado:', parsedUser.username, '| ID:', parsedUser.id);
        } catch (e) {
          console.error('🔍 Error parseando usuario:', e);
        }
      }
      console.log('🔍 === FIN DIAGNÓSTICO ===');
    }
  }, []);
  
  // Estado de autenticación
  const authContext = useAuth();
  const { isAuthenticated, user, isLoading: authLoading } = authContext;
  
  console.log('🏠 HistorialValuacionesContent: Contexto completo:', authContext);
  console.log('🏠 HistorialValuacionesContent: useAuth resultado:', { 
    isAuthenticated, 
    user: user?.username || 'null', 
    authLoading,
    userObject: user 
  });

  // Estado para las valuaciones
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    start_date: '',
    end_date: ''
  });

  // Estado para paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Estado para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalValuaciones: 0,
    valuacionesFinalizadas: 0,
    valuacionesPendientes: 0,
    totalProductos: 0,
    totalVenta: 0
  });

  // Crear servicio de valuación solo cuando sea necesario (memoizado)
  const valuationService = useMemo(() => {
    if (typeof window !== 'undefined') {
      console.log('Creando nueva instancia de ValuationService');
      return new ValuationService();
    }
    return null;
  }, []);

  // Actualizar token del servicio cuando cambie la autenticación
  useEffect(() => {
    console.log('Estado de autenticación cambió:', { isAuthenticated, user: user?.username, authLoading });
    if (isAuthenticated && user && valuationService) {
      console.log('Actualizando token en ValuationService...');
      valuationService.refreshAuthToken();
    }
  }, [isAuthenticated, user, valuationService]);

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('Effect para cargar valuaciones:', { isAuthenticated, authLoading, hasService: !!valuationService });
    if (isAuthenticated && !authLoading && valuationService) {
      console.log('Cargando valuaciones...');
      loadValuations();
    }
  }, [isAuthenticated, authLoading, valuationService, pagination.page, pagination.limit]);

  // Cargar valuaciones de la semana actual por defecto
  useEffect(() => {
    console.log('Effect setWeekFilters:', { isAuthenticated, authLoading, hasFilters: !!(filters.start_date && filters.end_date), hasService: !!valuationService });
    if (isAuthenticated && !authLoading && !filters.start_date && !filters.end_date && valuationService) {
      // Agregar un pequeño delay para asegurar que el componente esté completamente hidratado
      setTimeout(() => {
        console.log('Configurando filtros de semana...');
        setWeekFilters();
      }, 100);
    }
  }, [isAuthenticated, authLoading, valuationService]);

  // Establecer filtros para la semana actual
  const setWeekFilters = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    const startDate = firstDayOfWeek.toISOString().split('T')[0];
    const endDate = lastDayOfWeek.toISOString().split('T')[0];

    setFilters(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));

    // Cargar valuaciones con estos filtros
    loadValuations({ start_date: startDate, end_date: endDate });
  };

  // Cargar valuaciones desde la API
  const loadValuations = async (customFilters = null) => {
    console.log('=== Iniciando carga de valuaciones ===');
    
    if (!valuationService) {
      console.error('❌ ValuationService no está disponible');
      setError('Servicio no disponible. Recargue la página.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...(customFilters || filters)
      };

      // Filtrar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      console.log('Parámetros de consulta:', queryParams);
      console.log('Llamando a valuationService.getValuations...');

      const response = await valuationService.getValuations(queryParams);
      
      console.log('Respuesta recibida:', response);
      console.log('Número de valuaciones:', response.valuations?.length || 0);
      
      setValuations(response.valuations || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));

      calculateStatistics(response.valuations || []);
      console.log('✅ Valuaciones cargadas exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar valuaciones:', error);
      console.error('Detalles del error:', error.message);
      setError('Error al cargar las valuaciones. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
      console.log('=== Fin carga de valuaciones ===');
    }
  };

  // Calcular estadísticas
  const calculateStatistics = (data) => {
    const stats = data.reduce(
      (acc, valuation) => {
        acc.totalValuaciones++;
        
        if (valuation.status === 'completed') {
          acc.valuacionesFinalizadas++;
          if (valuation.total_purchase_amount) {
            const amount = parseFloat(valuation.total_purchase_amount);
            if (!isNaN(amount)) {
              acc.totalVenta += amount;
            }
          }
        } else if (valuation.status === 'pending') {
          acc.valuacionesPendientes++;
        }

        // Contar productos usando el campo items_count del backend
        if (valuation.items_count) {
          const count = parseInt(valuation.items_count);
          if (!isNaN(count)) {
            acc.totalProductos += count;
          }
        }

        return acc;
      },
      {
        totalValuaciones: 0,
        valuacionesFinalizadas: 0,
        valuacionesPendientes: 0,
        totalProductos: 0,
        totalVenta: 0
      }
    );

    setEstadisticas(stats);
  };

  // Manejar cambios en filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Aplicar filtros
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadValuations();
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  // Formatear moneda de manera segura
  const formatCurrency = (value) => {
    const numValue = parseFloat(value || 0);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  // Formatear estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Finalizada', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', class: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  // Navegar a detalle
  const navigateToDetail = (id) => {
    window.location.href = `/detalle-valuacion/${id}`;
  };

  // Imprimir valuación
  const printValuation = (id) => {
    alert(`Se imprimirá la valuación VP-${id}. En una implementación real, se generaría un PDF o se abriría la vista de impresión.`);
  };

  // Editar valuación
  const editValuation = (id) => {
    window.location.href = `/nueva-valuacion?edit=${id}`;
  };

  if (authLoading) {
    console.log('🔄 Mostrando pantalla de carga. Valores:', { authLoading, isAuthenticated, user: user?.username });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-claro mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Verificando autenticación...</h2>
          <p className="text-gray-500">Por favor espere</p>
          <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
            <p>AuthLoading: {authLoading.toString()}</p>
            <p>IsAuthenticated: {isAuthenticated.toString()}</p>
            <p>User: {user?.username || 'null'}</p>
            <p>Timestamp: {new Date().toLocaleTimeString()}</p>
          </div>
          
          {/* Botón de fuerza bruta para casos de problemas de hidratación */}
          <button 
            onClick={() => {
              console.log('🔄 Forzando recarga manual de la página...');
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Si queda cargando, haz clic aquí
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Diagnóstico adicional para la pantalla de acceso restringido
    let diagnosticInfo = '';
    if (typeof window !== 'undefined') {
      const rawToken = localStorage.getItem('entrepeques_auth_token');
      const rawUser = localStorage.getItem('entrepeques_user');
      diagnosticInfo = `
Token en localStorage: ${rawToken ? 'Presente' : 'Ausente'}
Usuario en localStorage: ${rawUser ? 'Presente' : 'Ausente'}
AuthContext isAuthenticated: ${isAuthenticated}
AuthContext user: ${user?.username || 'null'}
AuthContext loading: ${authLoading}
      `.trim();
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso restringido</h2>
          <p className="text-gray-600 mb-6">Debe iniciar sesión para ver el historial de valuaciones.</p>
          
          {/* Información de diagnóstico */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left text-xs">
            <h3 className="font-bold mb-2">Información de Diagnóstico:</h3>
            <pre className="whitespace-pre-wrap">{diagnosticInfo}</pre>
          </div>
          
          <div className="space-y-3">
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
            >
              Ir a iniciar sesión
            </a>
            
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  console.log('🔄 Forzando recarga completa...');
                  window.location.reload();
                }
              }}
              className="block w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Debug Info */}
      <DebugInfo />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-azul-profundo">Historial de Valuaciones</h1>
        <div className="flex items-center gap-4">
          {/* Botón de debug temporal */}
          <button 
            onClick={async () => {
              console.log('=== DEBUG INFO COMPLETO ===');
              console.log('AuthContext:', { isAuthenticated, user: user?.username, authLoading });
              console.log('ValuationService disponible:', !!valuationService);
              console.log('Tipo de window:', typeof window);
              
              // Debug directo del localStorage
              if (typeof window !== 'undefined') {
                const rawToken = localStorage.getItem('entrepeques_auth_token');
                const rawUser = localStorage.getItem('entrepeques_user');
                
                console.log('=== LOCALSTORAGE DEBUG ===');
                console.log('Raw token:', rawToken ? `${rawToken.substring(0, 50)}...` : 'null');
                console.log('Raw user JSON:', rawUser);
                
                if (rawUser) {
                  try {
                    const parsedUser = JSON.parse(rawUser);
                    console.log('Parsed user:', parsedUser);
                  } catch (e) {
                    console.error('Error parsing user:', e);
                  }
                }
                
                // Mostrar alerta con información resumida
                const summary = `
Estado Auth: ${isAuthenticated}
Loading: ${authLoading}
Token: ${rawToken ? 'Presente' : 'Ausente'}
Usuario: ${rawUser ? 'Presente' : 'Ausente'}
Service: ${valuationService ? 'OK' : 'Error'}
                `.trim();
                alert(summary);
              } else {
                alert('❌ Window no disponible');
              }
              
              if (!valuationService) {
                alert('❌ ValuationService no está disponible');
                return;
              }
              
              try {
                valuationService.refreshAuthToken();
                const testResponse = await valuationService.getValuations({ limit: 1 });
                console.log('✅ Test API call exitoso:', testResponse);
                alert('✅ Conexión exitosa: ' + JSON.stringify(testResponse, null, 2));
              } catch (error) {
                console.error('❌ Test API call falló:', error);
                alert('❌ Error en la conexión: ' + error.message);
              }
            }}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            Debug
          </button>
          
          {/* Botón de nuevo login para token fresco */}
          <button 
            onClick={() => {
              console.log('🔄 Redirigiendo a login para token fresco...');
              // Limpiar datos de autenticación actuales
              if (typeof window !== 'undefined') {
                localStorage.removeItem('entrepeques_auth_token');
                localStorage.removeItem('entrepeques_user');
              }
              // Redirigir a login
              window.location.href = '/login';
            }}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Token Expirado - Nuevo Login
          </button>
          
          <a 
            href="/nueva-valuacion" 
            className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Valuación
          </a>
        </div>
      </div>
      
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Valuaciones</p>
              <p className="text-2xl font-bold text-text">{estadisticas.totalValuaciones}</p>
            </div>
            <div className="p-2 bg-azul-claro/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-azul-claro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm">Valuaciones Finalizadas</p>
              <p className="text-2xl font-bold text-verde-oscuro">{estadisticas.valuacionesFinalizadas}</p>
            </div>
            <div className="p-2 bg-verde-lima/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-verde-lima" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Productos</p>
              <p className="text-2xl font-bold text-text">{estadisticas.totalProductos}</p>
            </div>
            <div className="p-2 bg-rosa/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rosa" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm">Valor Total (Compra)</p>
              <p className="text-2xl font-bold text-amarillo">${formatCurrency(estadisticas.totalVenta)}</p>
            </div>
            <div className="p-2 bg-amarillo/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtros de búsqueda */}
      <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium" htmlFor="busqueda">
              Buscar
            </label>
            <input 
              type="text" 
              id="busqueda" 
              placeholder="ID, cliente o teléfono" 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
            />
          </div>
          
          <div className="w-full md:w-48 space-y-1">
            <label className="block text-sm font-medium" htmlFor="estado">
              Estado
            </label>
            <select 
              id="estado" 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
            >
              <option value="">Todos</option>
              <option value="completed">Finalizadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          
          <div className="w-full md:w-48 space-y-1">
            <label className="block text-sm font-medium" htmlFor="fecha-desde">
              Desde
            </label>
            <input 
              type="date" 
              id="fecha-desde" 
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
            />
          </div>
          
          <div className="w-full md:w-48 space-y-1">
            <label className="block text-sm font-medium" htmlFor="fecha-hasta">
              Hasta
            </label>
            <input 
              type="date" 
              id="fecha-hasta" 
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
            />
          </div>
          
          <button 
            type="button" 
            onClick={applyFilters}
            disabled={loading}
            className="w-full md:w-auto px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors disabled:opacity-50"
          >
            {loading ? 'Filtrando...' : 'Filtrar'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Tabla de valuaciones */}
      <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-claro"></div>
            <span className="ml-2">Cargando valuaciones...</span>
          </div>
        ) : valuations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">No se encontraron valuaciones con los filtros seleccionados.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Productos</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Compra</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Consignación</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {valuations.map(valuation => (
                    <tr key={valuation.id} className="hover:bg-background-alt transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium">VP-{valuation.id}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm">{formatDate(valuation.valuation_date)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{valuation.client?.name || 'Cliente desconocido'}</div>
                          <div className="text-xs text-text-muted">{valuation.client?.phone || 'Sin teléfono'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {valuation.items_count || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        ${formatCurrency(valuation.total_purchase_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        ${formatCurrency(valuation.total_consignment_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {getStatusBadge(valuation.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => navigateToDetail(valuation.id)}
                            className="text-azul-claro hover:text-azul-profundo p-1"
                            title="Ver detalle"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {valuation.status === "pending" && (
                            <button 
                              onClick={() => editValuation(valuation.id)}
                              className="text-verde-lima hover:text-verde-oscuro p-1"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => printValuation(valuation.id)}
                            className="text-rosa hover:text-rosa/80 p-1"
                            title="Imprimir"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:bg-background-alt disabled:opacity-50"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="relative ml-3 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:bg-background-alt disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-text-muted">
                    Mostrando{' '}
                    <span className="font-medium">
                      {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button 
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md border border-border bg-background px-2 py-2 text-sm font-medium text-text-muted hover:bg-background-alt disabled:opacity-50"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`relative inline-flex items-center border border-border px-4 py-2 text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'bg-azul-claro text-white'
                              : 'bg-background text-text-muted hover:bg-background-alt'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                      className="relative inline-flex items-center rounded-r-md border border-border bg-background px-2 py-2 text-sm font-medium text-text-muted hover:bg-background-alt disabled:opacity-50"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.414l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HistorialValuaciones() {
  return (
    <AuthProvider>
      <HistorialValuacionesContent />
    </AuthProvider>
  );
} 