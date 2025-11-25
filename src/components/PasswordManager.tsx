import { useState } from 'react';
import PasswordForm from './PasswordGenerator';
import PasswordList from './PasswordList';

export default function PasswordManager() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editId, setEditId] = useState<string | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setEditId(undefined);
    setView('create');
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setView('edit');
  };

  const handleSave = () => {
    setView('list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setEditId(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                view === 'list'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              📋 Mis Contraseñas
            </button>
            <button
              onClick={handleCreateNew}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                view === 'create' || view === 'edit'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ➕ Nueva Contraseña
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            🔐 Gestor de Contraseñas
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <PasswordList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      ) : (
        <PasswordForm
          editId={editId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
