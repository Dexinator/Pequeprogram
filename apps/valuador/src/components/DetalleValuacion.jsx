import React, { useState, useEffect } from 'react';
import { ValuationService } from '../services/valuation.service';
import { useAuth, AuthProvider } from '../context/AuthContext';

// Componente StatusBadge para mostrar el estado de la valuación
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          text: 'Pendiente',
          classes: 'bg-amarillo/20 text-amarillo border-amarillo/30'
        };
      case 'completed':
        return {
          text: 'Finalizada',
          classes: 'bg-verde-lima/20 text-verde-oscuro border-verde-lima/30'
        };
      case 'cancelled':
        return {
          text: 'Cancelada',
          classes: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: 'Desconocido',
          classes: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.classes}`}>
      {config.text}
    </span>
  );
};

// Componente para mostrar el resumen de una valuación
const ValuacionResumen = ({ cliente, productos, totalCompra, totalVenta, totalConsignacion, valuacionId, fecha }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getModalityBadge = (modality) => {
    if (modality === 'consignación') {
      return 'bg-azul-claro/20 text-azul-claro border-azul-claro/30';
    } else {
      return 'bg-verde-lima/20 text-verde-oscuro border-verde-lima/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Información del Cliente */}
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-heading font-bold mb-4 text-azul-profundo">Información del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-text-muted text-sm">Nombre</p>
            <p className="font-medium">{cliente?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-text-muted text-sm">Teléfono</p>
            <p className="font-medium">{cliente?.phone || 'N/A'}</p>
          </div>
          {cliente?.email && (
            <div>
              <p className="text-text-muted text-sm">Email</p>
              <p className="font-medium">{cliente.email}</p>
            </div>
          )}
          {cliente?.identification && (
            <div>
              <p className="text-text-muted text-sm">Identificación</p>
              <p className="font-medium">{cliente.identification}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-heading font-bold mb-4 text-azul-profundo">Productos Valuados</h2>
        {productos && productos.length > 0 ? (
          <div className="space-y-4">
            {productos.map((producto, index) => (
              <div key={producto.id || index} className="border border-border rounded-lg p-4 bg-background">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Información del producto */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-azul-profundo">Producto #{index + 1}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getModalityBadge(producto.modality)}`}>
                        {producto.modality}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-text-muted">Categoría:</span>
                        <span className="ml-1 font-medium">{producto.category_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Subcategoría:</span>
                        <span className="ml-1 font-medium">{producto.subcategory_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Marca:</span>
                        <span className="ml-1 font-medium">{producto.brand_name || producto.brand_renown || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Estado:</span>
                        <span className="ml-1 font-medium">{producto.status}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Condición:</span>
                        <span className="ml-1 font-medium">{producto.condition_state}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Demanda:</span>
                        <span className="ml-1 font-medium">{producto.demand}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Limpieza:</span>
                        <span className="ml-1 font-medium">{producto.cleanliness}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Cantidad:</span>
                        <span className="ml-1 font-medium">{Number(producto.quantity) || 1}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Precio nuevo:</span>
                        <span className="ml-1 font-medium">{formatCurrency(producto.new_price)}</span>
                      </div>
                    </div>

                    {producto.notes && (
                      <div className="mt-3">
                        <span className="text-text-muted text-sm">Notas:</span>
                        <p className="text-sm mt-1">{producto.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Precios calculados */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-text-muted text-sm">Precio de Compra</p>
                      <p className="text-lg font-bold text-verde-oscuro">
                        {formatCurrency(producto.final_purchase_price || producto.suggested_purchase_price)}
                      </p>
                      {(Number(producto.quantity) || 1) > 1 && (
                        <p className="text-xs text-text-muted">
                          Total: {formatCurrency((producto.final_purchase_price || producto.suggested_purchase_price) * (Number(producto.quantity) || 1))}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-text-muted text-sm">Precio de Venta</p>
                      <p className="text-lg font-bold text-azul-profundo">
                        {formatCurrency(producto.final_sale_price || producto.suggested_sale_price)}
                      </p>
                      {(Number(producto.quantity) || 1) > 1 && (
                        <p className="text-xs text-text-muted">
                          Total: {formatCurrency((producto.final_sale_price || producto.suggested_sale_price) * (Number(producto.quantity) || 1))}
                        </p>
                      )}
                    </div>

                    {producto.modality === 'consignación' && producto.consignment_price && (
                      <div className="text-center">
                        <p className="text-text-muted text-sm">Precio Consignación</p>
                        <p className="text-lg font-bold text-amarillo">
                          {formatCurrency(producto.consignment_price)}
                        </p>
                        {(Number(producto.quantity) || 1) > 1 && (
                          <p className="text-xs text-text-muted">
                            Total: {formatCurrency(producto.consignment_price * (Number(producto.quantity) || 1))}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No hay productos en esta valuación.</p>
        )}
      </div>

      {/* Resumen de Totales */}
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-heading font-bold mb-4 text-azul-profundo">Resumen de Valuación</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-verde-lima/10 rounded-lg border border-verde-lima/20">
            <p className="text-text-muted text-sm">Total Compra</p>
            <p className="text-2xl font-bold text-verde-oscuro">{formatCurrency(totalCompra)}</p>
          </div>
          
          <div className="text-center p-4 bg-azul-claro/10 rounded-lg border border-azul-claro/20">
            <p className="text-text-muted text-sm">Total Venta</p>
            <p className="text-2xl font-bold text-azul-profundo">{formatCurrency(totalVenta)}</p>
          </div>

          {totalConsignacion > 0 && (
            <div className="text-center p-4 bg-amarillo/10 rounded-lg border border-amarillo/20">
              <p className="text-text-muted text-sm">Total Consignación</p>
              <p className="text-2xl font-bold text-amarillo">{formatCurrency(totalConsignacion)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal de detalle de valuación
function DetalleValuacionContent({ valuationId }) {
  console.log('🔍 DetalleValuacionContent: Componente renderizándose para ID:', valuationId);
  
  // Estado de autenticación
  const authContext = useAuth();
  const { isAuthenticated, user, isLoading: authLoading } = authContext;
  
  console.log('🔍 DetalleValuacion: Estado de autenticación:', { 
    isAuthenticated, 
    user: user?.username || 'null', 
    authLoading 
  });

  // Estados del componente
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);

  // Instanciar servicio de valuación
  const valuationService = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return new ValuationService();
    }
    return null;
  }, []);

  // Actualizar token del servicio cuando cambie la autenticación
  useEffect(() => {
    if (isAuthenticated && user && valuationService) {
      valuationService.refreshAuthToken();
    }
  }, [isAuthenticated, user, valuationService]);

  // Cargar datos de la valuación
  useEffect(() => {
    if (isAuthenticated && !authLoading && valuationService && valuationId) {
      loadValuationData();
    }
  }, [isAuthenticated, authLoading, valuationService, valuationId]);

  const loadValuationData = async () => {
    console.log('🔍 Cargando datos de valuación ID:', valuationId);
    setLoading(true);
    setError(null);

    try {
      // Cargar valuación
      const valuationData = await valuationService.getValuation(valuationId);
      
      if (!valuationData) {
        setError('Valuación no encontrada');
        setLoading(false);
        return;
      }

      console.log('🔍 Datos de valuación cargados:', valuationData);
      setValuation(valuationData);

      // Cargar información del cliente
      if (valuationData.client_id) {
        try {
          const clientData = await valuationService.getClient(valuationData.client_id);
          console.log('🔍 Datos de cliente cargados:', clientData);
          setClient(clientData);
        } catch (clientError) {
          console.warn('⚠️ No se pudo cargar información del cliente:', clientError);
        }
      }

    } catch (error) {
      console.error('❌ Error al cargar valuación:', error);
      setError('Error al cargar la valuación. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateTotals = (items) => {
    if (!items || items.length === 0) {
      return { totalCompra: 0, totalVenta: 0, totalConsignacion: 0 };
    }

    let totalCompra = 0;
    let totalVenta = 0;
    let totalConsignacion = 0;

    items.forEach(item => {
      const purchasePrice = item.final_purchase_price || item.suggested_purchase_price || 0;
      const salePrice = item.final_sale_price || item.suggested_sale_price || 0;
      const consignmentPrice = item.consignment_price || 0;
      const quantity = Number(item.quantity) || 1;

      totalCompra += purchasePrice * quantity;
      totalVenta += salePrice * quantity;
      
      if (item.modality === 'consignación') {
        totalConsignacion += consignmentPrice * quantity;
      }
    });

    return { totalCompra, totalVenta, totalConsignacion };
  };

  const handlePrint = () => {
    alert(`Se imprimirá la valuación VP-${valuationId}. En una implementación real, se generaría un PDF o se abriría la vista de impresión.`);
  };

  const handleEdit = () => {
    window.location.href = `/nueva-valuacion?edit=${valuationId}`;
  };

  const goBack = () => {
    window.location.href = '/historial';
  };

  // Estados de carga y error
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-claro mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Verificando autenticación...</h2>
          <p className="text-gray-500">Por favor espere</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso restringido</h2>
          <p className="text-gray-600 mb-6">Debe iniciar sesión para ver el detalle de valuaciones.</p>
          <a 
            href="/login" 
            className="inline-flex items-center px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-claro mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Cargando valuación...</h2>
          <p className="text-gray-500">Por favor espere</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={goBack}
              className="inline-flex items-center px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
            >
              Volver al historial
            </button>
            <button 
              onClick={loadValuationData}
              className="block w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!valuation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Valuación no encontrada</h2>
          <p className="text-gray-600 mb-6">La valuación solicitada no existe o no tiene permisos para verla.</p>
          <button 
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
          >
            Volver al historial
          </button>
        </div>
      </div>
    );
  }

  // Calcular totales
  const { totalCompra, totalVenta, totalConsignacion } = calculateTotals(valuation.items);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={goBack}
            className="text-azul-claro hover:text-azul-profundo"
            title="Volver al historial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-heading font-bold text-azul-profundo">Valuación VP-{valuationId}</h1>
          <StatusBadge status={valuation.status} />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handlePrint}
            className="px-5 py-2 border border-border bg-background rounded-md hover:bg-background-alt transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
            </svg>
            Imprimir
          </button>
          
          {valuation.status === "pending" && (
            <button 
              onClick={handleEdit}
              className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>
      
      {/* Metadatos de la valuación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amarillo/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-text-muted text-sm">Fecha</p>
              <p className="font-medium">{formatDate(valuation.valuation_date || valuation.created_at)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-azul-claro/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-azul-claro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-text-muted text-sm">Valuador</p>
              <p className="font-medium">{user?.username || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-alt p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-verde-lima/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-verde-lima" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <p className="text-text-muted text-sm">Productos</p>
              <p className="font-medium">{valuation.items?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resumen de Valuación */}
      <ValuacionResumen 
        cliente={client} 
        productos={valuation.items || []}
        totalCompra={totalCompra}
        totalVenta={totalVenta}
        totalConsignacion={totalConsignacion}
        valuacionId={valuationId}
        fecha={formatDate(valuation.valuation_date || valuation.created_at)}
      />
      
      {/* Notas */}
      {valuation.notes && (
        <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-heading font-bold mb-3 text-azul-profundo">Notas</h2>
          <p className="text-text">{valuation.notes}</p>
        </div>
      )}
      
      {/* Historial de cambios */}
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-heading font-bold mb-3 text-azul-profundo">Historial</h2>
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-full bg-azul-claro/20 flex items-center justify-center text-azul-claro">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Valuación creada</p>
              <p className="text-text-muted text-sm">{formatDate(valuation.created_at)} por {user?.username}</p>
            </div>
          </div>
          
          {valuation.status === 'completed' && (
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-verde-lima/20 flex items-center justify-center text-verde-oscuro">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Valuación finalizada</p>
                <p className="text-text-muted text-sm">{formatDate(valuation.updated_at)}</p>
              </div>
            </div>
          )}
          
          {valuation.status === 'cancelled' && (
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Valuación cancelada</p>
                <p className="text-text-muted text-sm">{formatDate(valuation.updated_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente envoltorio con AuthProvider
export default function DetalleValuacion({ valuationId }) {
  return (
    <AuthProvider>
      <DetalleValuacionContent valuationId={valuationId} />
    </AuthProvider>
  );
} 