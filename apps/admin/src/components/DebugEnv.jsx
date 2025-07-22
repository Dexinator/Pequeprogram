import React from 'react';

const DebugEnv = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const envVars = {
    'PUBLIC_API_URL': import.meta.env.PUBLIC_API_URL || 'No definida',
    'MODE': import.meta.env.MODE || 'No definida',
    'PROD': import.meta.env.PROD ? 'true' : 'false',
    'DEV': import.meta.env.DEV ? 'true' : 'false',
    'SSR': import.meta.env.SSR ? 'true' : 'false',
  };

  const publicVars = Object.keys(import.meta.env)
    .filter(key => key.startsWith('PUBLIC_'))
    .reduce((acc, key) => {
      acc[key] = import.meta.env[key];
      return acc;
    }, {});

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs font-mono">
      <h3 className="font-bold mb-2">Variables de Entorno - Admin</h3>
      <div className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key}>
            <span className="text-yellow-400">{key}:</span> {value}
          </div>
        ))}
      </div>
      {Object.keys(publicVars).length > 0 && (
        <>
          <h4 className="font-bold mt-3 mb-1">Variables PUBLIC_:</h4>
          <div className="space-y-1">
            {Object.entries(publicVars).map(([key, value]) => (
              <div key={key}>
                <span className="text-green-400">{key}:</span> {value}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DebugEnv;