import { useState, useEffect } from 'react';
import { getAllPasswords, deletePassword } from '@/services/database';
import { importDatabase } from '@/services/database';
import type { Password } from '@/types';

interface PasswordListProps {
  onEdit?: (id: string) => void;
  refreshTrigger?: number;
}

export default function PasswordList({ onEdit, refreshTrigger }: PasswordListProps) {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const categories = [
    'all',
    'Social Media',
    'Banking',
    'Email',
    'Work',
    'Shopping',
    'Entertainment',
    'Health',
    'Education',
    'Travel',
    'Other'
  ];

  useEffect(() => {
    loadPasswords();
  }, [refreshTrigger]);

  const loadPasswords = async () => {
    try {
      setLoading(true);
      const data = await getAllPasswords();
      setPasswords(data);
    } catch (error) {
      console.error('Error loading passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta contraseña?')) {
      try {
        await deletePassword(id);
        await loadPasswords();
      } catch (error) {
        console.error('Error deleting password:', error);
        alert('Error al eliminar la contraseña');
      }
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      await importDatabase(data);
      await loadPasswords();
      setShowImportModal(false);
      alert('¡Contraseñas importadas exitosamente!');
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error al importar el archivo. Verifica el formato JSON.');
    }
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        passwords: passwords,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalPasswords: passwords.length
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `passwords-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      alert('¡Contraseñas exportadas exitosamente!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar las contraseñas.');
    }
  };

  const handleExportFiltered = () => {
    try {
      const exportData = {
        passwords: filteredPasswords,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalPasswords: filteredPasswords.length,
        filters: {
          searchQuery: searchQuery || 'none',
          category: selectedCategory
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `passwords-filtered-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      alert(`¡${filteredPasswords.length} contraseñas exportadas exitosamente!`);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar las contraseñas.');
    }
  };

  const filteredPasswords = passwords.filter(pwd => {
    const matchesSearch = 
      pwd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.url?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      pwd.tags.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const favoritePasswords = filteredPasswords.filter(p => p.favorite);
  const regularPasswords = filteredPasswords.filter(p => !p.favorite);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mis Contraseñas ({filteredPasswords.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📤 Exportar
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📥 Importar
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar contraseñas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Section */}
        {favoritePasswords.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              ⭐ Favoritos
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoritePasswords.map(pwd => (
                <PasswordCard
                  key={pwd.id}
                  password={pwd}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Passwords */}
        {regularPasswords.length > 0 ? (
          <div>
            {favoritePasswords.length > 0 && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Todas las contraseñas
              </h3>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularPasswords.map(pwd => (
                <PasswordCard
                  key={pwd.id}
                  password={pwd}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : filteredPasswords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No se encontraron contraseñas con estos filtros'
                : 'No hay contraseñas guardadas. ¡Crea tu primera contraseña!'}
            </p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Importar Contraseñas
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                  id="json-import"
                />
                <label
                  htmlFor="json-import"
                  className="cursor-pointer block"
                >
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Seleccionar archivo JSON
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Formato exportado desde esta app
                  </p>
                </label>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Importante:</strong> Asegúrate de que el archivo JSON tenga el formato correcto de exportación.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Exportar Contraseñas
            </h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  📊 <strong>Estadísticas:</strong>
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Total de contraseñas: {passwords.length}</li>
                  <li>• Contraseñas filtradas: {filteredPasswords.length}</li>
                  {searchQuery && <li>• Búsqueda activa: "{searchQuery}"</li>}
                  {selectedCategory !== 'all' && <li>• Categoría: {selectedCategory}</li>}
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportJSON}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-between"
                >
                  <span>📤 Exportar Todas ({passwords.length})</span>
                  <span className="text-sm opacity-80">JSON</span>
                </button>

                {(searchQuery || selectedCategory !== 'all') && filteredPasswords.length < passwords.length && (
                  <button
                    onClick={handleExportFiltered}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-between"
                  >
                    <span>🔍 Exportar Filtradas ({filteredPasswords.length})</span>
                    <span className="text-sm opacity-80">JSON</span>
                  </button>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Seguridad:</strong> El archivo exportado contiene tus contraseñas encriptadas. Guárdalo en un lugar seguro.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PasswordCardProps {
  password: Password;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
}

function PasswordCard({ password, onEdit, onDelete }: PasswordCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {password.favorite && <span>⭐</span>}
            {password.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {password.username}
          </p>
        </div>
      </div>

      {password.url && (
        <a
          href={password.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline block mb-2"
        >
          🌐 {password.url}
        </a>
      )}

      {password.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {password.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {password.notes && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          📝 {password.notes}
        </p>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => copyToClipboard(password.username)}
          className="flex-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          title="Copiar usuario"
        >
          📋 Usuario
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(password.id)}
            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition"
            title="Editar"
          >
            ✏️
          </button>
        )}
        <button
          onClick={() => onDelete(password.id)}
          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
