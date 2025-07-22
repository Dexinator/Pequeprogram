export function DebugEnv() {
  if (typeof window !== 'undefined') {
    console.log('🔍 Variables de entorno disponibles:');
    console.log('import.meta.env:', import.meta.env);
    console.log('PUBLIC_API_URL:', import.meta.env.PUBLIC_API_URL);
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: '#333', 
      color: '#fff', 
      padding: '10px',
      fontSize: '12px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      <div>API URL: {import.meta.env.PUBLIC_API_URL || 'NO CONFIGURADA'}</div>
      <div>Mode: {import.meta.env.MODE}</div>
    </div>
  );
}