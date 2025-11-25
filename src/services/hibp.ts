/**
 * Have I Been Pwned (HIBP) API Service
 * Verifica si contraseñas han sido comprometidas en filtraciones de datos
 */

import type { BreachCheckResult, Breach } from '@/types';
import { generateChecksum } from '@crypto/encryption';

const HIBP_API_BASE = 'https://api.pwnedpasswords.com';
const HIBP_BREACHES_API = 'https://haveibeenpwned.com/api/v3';

/**
 * Verifica si una contraseña ha sido comprometida usando k-Anonymity
 * Solo envía los primeros 5 caracteres del hash SHA-1
 */
export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    // Generar SHA-1 hash de la contraseña
    const hash = await sha1(password);
    const hashUpper = hash.toUpperCase();
    
    // Usar k-Anonymity: enviar solo los primeros 5 caracteres
    const prefix = hashUpper.substring(0, 5);
    const suffix = hashUpper.substring(5);

    // Consultar API
    const response = await fetch(`${HIBP_API_BASE}/range/${prefix}`, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true', // Añade padding para privacidad
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check password breach');
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Buscar el sufijo en los resultados
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return {
          isCompromised: true,
          breachCount: parseInt(count, 10),
        };
      }
    }

    return {
      isCompromised: false,
      breachCount: 0,
    };
  } catch (error) {
    console.error('HIBP API error:', error);
    // En caso de error, no bloqueamos el uso
    return {
      isCompromised: false,
      breachCount: 0,
    };
  }
}

/**
 * Verifica múltiples contraseñas de forma eficiente
 */
export async function checkMultiplePasswords(
  passwords: string[]
): Promise<Map<string, BreachCheckResult>> {
  const results = new Map<string, BreachCheckResult>();

  // Procesar en lotes para no saturar la API
  const batchSize = 5;
  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((pwd) => checkPasswordBreach(pwd))
    );

    batch.forEach((pwd, index) => {
      results.set(pwd, batchResults[index]);
    });

    // Delay entre lotes (rate limiting)
    if (i + batchSize < passwords.length) {
      await delay(1500); // 1.5 segundos entre lotes
    }
  }

  return results;
}

/**
 * Obtiene información de filtraciones de datos por cuenta de email
 * Requiere API key de HIBP (versión premium)
 */
export async function checkEmailBreaches(
  email: string,
  apiKey?: string
): Promise<Breach[]> {
  if (!apiKey) {
    console.warn('HIBP API key not provided. Email breach check skipped.');
    return [];
  }

  try {
    const response = await fetch(
      `${HIBP_BREACHES_API}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        method: 'GET',
        headers: {
          'hibp-api-key': apiKey,
          'User-Agent': 'PasswordManagerPWA',
        },
      }
    );

    if (response.status === 404) {
      // No se encontraron filtraciones
      return [];
    }

    if (!response.ok) {
      throw new Error('Failed to check email breaches');
    }

    const breaches: Breach[] = await response.json();
    return breaches;
  } catch (error) {
    console.error('HIBP email breach check error:', error);
    return [];
  }
}

/**
 * Obtiene todas las filtraciones públicas conocidas
 */
export async function getAllBreaches(): Promise<Breach[]> {
  try {
    const response = await fetch(`${HIBP_BREACHES_API}/breaches`, {
      method: 'GET',
      headers: {
        'User-Agent': 'PasswordManagerPWA',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch breaches');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch breaches:', error);
    return [];
  }
}

/**
 * Verifica si un dominio ha tenido filtraciones
 */
export async function checkDomainBreaches(domain: string): Promise<Breach[]> {
  try {
    const allBreaches = await getAllBreaches();
    return allBreaches.filter((breach) =>
      breach.domain.toLowerCase().includes(domain.toLowerCase())
    );
  } catch (error) {
    console.error('Domain breach check error:', error);
    return [];
  }
}

/**
 * Genera un hash SHA-1 (usado por HIBP)
 */
async function sha1(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // Convertir a hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Delay helper para rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Almacena en caché los resultados de verificación
 */
class BreachCache {
  private cache = new Map<string, { result: BreachCheckResult; timestamp: number }>();
  private readonly TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

  async get(password: string): Promise<BreachCheckResult | null> {
    const key = await generateChecksum(password);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  async set(password: string, result: BreachCheckResult): Promise<void> {
    const key = await generateChecksum(password);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Instancia global del cache
export const breachCache = new BreachCache();

/**
 * Verifica contraseña con caché
 */
export async function checkPasswordBreachCached(
  password: string
): Promise<BreachCheckResult> {
  // Intentar obtener del caché
  const cached = await breachCache.get(password);
  if (cached) {
    return cached;
  }

  // Si no está en caché, consultar API
  const result = await checkPasswordBreach(password);
  
  // Guardar en caché
  await breachCache.set(password, result);

  return result;
}
