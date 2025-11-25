import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { 
  generatePassword, 
  analyzePasswordStrength, 
  generatePassphrase,
  DEFAULT_OPTIONS 
} from '@/crypto/passwordGenerator';
import { encryptData, deriveMasterKey, decryptData } from '@/crypto/encryption';
import { addPassword, updatePassword, getPasswordById } from '@/services/database';
import type { Password, PasswordGeneratorOptions, EncryptedData } from '@/types';

interface PasswordFormProps {
  editId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function PasswordForm({ editId, onSave, onCancel }: PasswordFormProps) {
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: '',
    favorite: false,
  });

  // Password generator options
  const [generatorOptions, setGeneratorOptions] = useState<PasswordGeneratorOptions>(DEFAULT_OPTIONS);
  const [showGenerator, setShowGenerator] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categories predefined
  const categories = [
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

  // Load password if editing
  useEffect(() => {
    if (editId) {
      loadPassword(editId);
    }
  }, [editId]);

  // Analyze password strength when password changes
  useEffect(() => {
    if (formData.password) {
      const strength = analyzePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const loadPassword = async (id: string) => {
    try {
      setLoading(true);
      const password = await getPasswordById(id);
      if (password) {
        // Decrypt password for editing
        let decryptedPassword = '';
        try {
          const tempMasterPassword = 'temp-master-password';
          const masterKeyData = await deriveMasterKey(tempMasterPassword);
          
          // Parse encrypted data
          console.log('Encrypted password string:', password.encryptedPassword);
          const encryptedData: EncryptedData = JSON.parse(password.encryptedPassword);
          console.log('Parsed encrypted data:', encryptedData);
          
          // Decrypt
          decryptedPassword = await decryptData(encryptedData, masterKeyData.key);
          console.log('Decryption successful');
        } catch (decryptError) {
          console.error('Error decrypting password:', decryptError);
          console.error('Error details:', {
            message: (decryptError as Error).message,
            stack: (decryptError as Error).stack
          });
          // Don't show error message, just leave password empty for user to set a new one
          decryptedPassword = '';
        }

        setFormData({
          title: password.title,
          username: password.username,
          password: decryptedPassword,
          url: password.url || '',
          notes: password.notes || '',
          category: password.tags[0] || '',
          favorite: password.favorite,
        });
        
        // Clear any previous errors if loading was successful
        if (decryptedPassword) {
          setError('');
        }
      }
    } catch (err) {
      console.error('Error loading password:', err);
      setError('Error al cargar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleGeneratePassword = () => {
    try {
      const newPassword = generatePassword(generatorOptions);
      setFormData(prev => ({ ...prev, password: newPassword }));
      setError('');
    } catch (err) {
      setError('Error al generar la contraseña');
    }
  };

  const handleGeneratePassphrase = () => {
    try {
      const passphrase = generatePassphrase(5, '-', true);
      setFormData(prev => ({ ...prev, password: passphrase }));
      setError('');
    } catch (err) {
      setError('Error al generar la frase de contraseña');
    }
  };

  const handleGeneratorOptionChange = (option: keyof PasswordGeneratorOptions, value: any) => {
    setGeneratorOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.title.trim()) {
      setError('El nombre/alias es requerido');
      return;
    }
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }
    if (!formData.password) {
      setError('La contraseña es requerida');
      return;
    }

    try {
      setLoading(true);
      
      // Encrypt password using a temporary master key
      // In production, you should get this from user authentication
      const tempMasterPassword = 'temp-master-password'; // Replace with actual user's master password
      const masterKeyData = await deriveMasterKey(tempMasterPassword);
      const encryptedPassword = await encryptData(formData.password, masterKeyData.key);

      // Get original password data if editing to preserve createdAt
      let originalPassword: Password | undefined;
      if (editId) {
        originalPassword = await getPasswordById(editId);
      }

      const passwordData: Password = {
        id: editId || nanoid(),
        title: formData.title,
        username: formData.username,
        encryptedPassword: JSON.stringify(encryptedPassword),
        url: formData.url || undefined,
        notes: formData.notes || undefined,
        tags: formData.category ? [formData.category] : [],
        favorite: formData.favorite,
        createdAt: originalPassword?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editId) {
        await updatePassword(passwordData);
        setSuccess('Contraseña actualizada exitosamente');
      } else {
        await addPassword(passwordData);
        setSuccess('Contraseña guardada exitosamente');
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          username: '',
          password: '',
          url: '',
          notes: '',
          category: '',
          favorite: false,
        });
        setSuccess('');
        if (onSave) onSave();
      }, 1500);

    } catch (err) {
      setError('Error al guardar la contraseña');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return colors[score] || 'bg-gray-500';
  };

  const getStrengthText = (score: number) => {
    const texts = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
    return texts[score] || 'Desconocida';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {editId ? 'Editar Contraseña' : 'Nueva Contraseña'}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning if password couldn't be decrypted */}
          {editId && !formData.password && (
            <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 rounded">
              <p className="font-semibold mb-1">⚠️ No se pudo desencriptar la contraseña</p>
              <p className="text-sm">
                La contraseña encriptada no se pudo descifrar. Esto puede ocurrir si fue encriptada con una clave diferente.
                Puedes establecer una nueva contraseña o contactar soporte.
              </p>
            </div>
          )}

          {/* Nombre/Alias - Required */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre / Alias <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Mi cuenta de Gmail"
            />
          </div>

          {/* Username - Required */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de usuario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          {/* Password - Required */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ingresa o genera una contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                🎲 Generar
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback.warning && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ {passwordStrength.feedback.warning}</p>
                )}
                {passwordStrength.feedback.suggestions.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    💡 {passwordStrength.feedback.suggestions[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Password Generator Panel */}
          {showGenerator && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Generador de Contraseñas
              </h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitud: {generatorOptions.length}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={generatorOptions.length}
                    onChange={(e) => handleGeneratorOptionChange('length', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={generatorOptions.includeUppercase}
                      onChange={(e) => handleGeneratorOptionChange('includeUppercase', e.target.checked)}
                      className="rounded"
                    />
                    <span>Mayúsculas (A-Z)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={generatorOptions.includeLowercase}
                      onChange={(e) => handleGeneratorOptionChange('includeLowercase', e.target.checked)}
                      className="rounded"
                    />
                    <span>Minúsculas (a-z)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={generatorOptions.includeNumbers}
                      onChange={(e) => handleGeneratorOptionChange('includeNumbers', e.target.checked)}
                      className="rounded"
                    />
                    <span>Números (0-9)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={generatorOptions.includeSymbols}
                      onChange={(e) => handleGeneratorOptionChange('includeSymbols', e.target.checked)}
                      className="rounded"
                    />
                    <span>Símbolos (!@#$)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={generatorOptions.excludeSimilar}
                      onChange={(e) => handleGeneratorOptionChange('excludeSimilar', e.target.checked)}
                      className="rounded"
                    />
                    <span>Excluir similares (iI1lO0)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={generatorOptions.excludeAmbiguous}
                      onChange={(e) => handleGeneratorOptionChange('excludeAmbiguous', e.target.checked)}
                      className="rounded"
                    />
                    <span>Excluir ambiguos</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  🔐 Generar Contraseña
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePassphrase}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  📝 Generar Frase
                </button>
              </div>
            </div>
          )}

          {/* Website URL - Optional */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sitio Web (opcional)
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://ejemplo.com"
            />
          </div>

          {/* Category - Optional */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría (opcional)
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Notes - Optional */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Información adicional sobre esta contraseña..."
            />
          </div>

          {/* Favorite Toggle */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="favorite"
                checked={formData.favorite}
                onChange={handleInputChange}
                className="w-5 h-5 rounded text-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ⭐ Marcar como favorito
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Guardando...' : editId ? '💾 Actualizar' : '💾 Guardar'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
