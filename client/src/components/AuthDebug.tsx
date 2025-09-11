import React from 'react';
import { useAuthStore } from '../store/auth';

const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuthStore();

  const checkLocalStorage = () => {
    const authStorage = localStorage.getItem('auth-storage');
    console.log('LocalStorage auth-storage:', authStorage);
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('Parsed auth data:', parsed);
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>User ID: {user?.id || 'N/A'}</div>
        <div>User Email: {user?.email || 'N/A'}</div>
        <div>Token: {token ? '✅' : '❌'}</div>
        <button 
          onClick={checkLocalStorage}
          className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          Check LocalStorage
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;

