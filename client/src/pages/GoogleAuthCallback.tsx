import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = () => {
      try {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          // Error en la autenticación
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
          return;
        }

        if (code) {
          // Intercambiar código por token
          exchangeCodeForToken(code);
        } else {
          // No hay código, error
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No se recibió código de autorización'
          }, window.location.origin);
          window.close();
        }
      } catch (error) {
        console.error('Error en callback de Google:', error);
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'Error interno en el callback'
        }, window.location.origin);
        window.close();
      }
    };

    const exchangeCodeForToken = async (code: string) => {
      try {
        // Enviar código al backend para procesar
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirectUri: `${window.location.origin}/auth/google/callback`
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al procesar la autenticación');
        }

        const authData = await response.json();

        // Enviar datos al popup padre
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          authData: authData
        }, window.location.origin);

        window.close();
      } catch (error) {
        console.error('Error al intercambiar código:', error);
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Error al procesar la autenticación'
        }, window.location.origin);
        window.close();
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Procesando autenticación...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor espera mientras completamos tu inicio de sesión con Google.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
