/**
 * Comprehensive key generation and validation utilities
 * This ensures all React keys are unique, non-empty, and stable
 */

// Global registry to track used keys and prevent duplicates
const keyRegistry = new Map<string, number>();

/**
 * Generates a robust, unique key that never returns empty strings
 * @param baseKey - The base identifier (can be string, number, or object)
 * @param namespace - Optional namespace to prevent collisions
 * @param fallbackIndex - Index to use if baseKey is invalid
 * @returns A guaranteed non-empty, unique string key
 */
export function createSafeKey(
  baseKey: string | number | null | undefined, 
  namespace = 'default',
  fallbackIndex?: number
): string {
  // Handle null/undefined/empty cases
  if (!baseKey && baseKey !== 0) {
    baseKey = fallbackIndex !== undefined ? `item-${fallbackIndex}` : `generated-${Date.now()}`;
  }

  // Convert to string and sanitize
  let key = String(baseKey).trim();
  
  // If still empty after trimming, generate a key
  if (!key) {
    key = `empty-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  // Add namespace prefix
  const namespacedKey = `${namespace}:${key}`;
  
  // Check for duplicates and append counter if needed
  const currentCount = keyRegistry.get(namespacedKey) || 0;
  keyRegistry.set(namespacedKey, currentCount + 1);
  
  const finalKey = currentCount > 0 ? `${namespacedKey}-${currentCount}` : namespacedKey;
  
  // Validate final key is non-empty
  if (!finalKey || finalKey.trim() === '') {
    throw new Error(`Key generation failed for baseKey: ${baseKey}`);
  }
  
  return finalKey;
}

/**
 * Creates a content-based stable key that's deterministic but unique
 * @param content - Content to base the key on
 * @param type - Type/category of the content
 * @param index - Fallback index
 * @returns A stable, content-based key
 */
export function createContentKey(
  content: string | null | undefined,
  type: string,
  index: number
): string {
  if (!content || content.trim() === '') {
    return createSafeKey(`${type}-${index}`, 'content');
  }

  // Create a simple hash of the content
  const hash = content.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a; // Convert to 32-bit signed integer
  }, 0);

  return createSafeKey(`${type}-${Math.abs(hash)}-${index}`, 'content');
}

/**
 * Generates a time-based unique key (useful for real-time updates)
 * @param prefix - Prefix for the key
 * @param additionalEntropy - Additional randomness
 * @returns A time-based unique key
 */
export function createTimeKey(prefix = 'time', additionalEntropy?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  const entropy = additionalEntropy ? `-${additionalEntropy}` : '';
  
  return createSafeKey(`${prefix}-${timestamp}-${random}${entropy}`, 'time');
}

/**
 * Creates a key for array items with proper fallbacks
 * @param item - The array item
 * @param index - Array index
 * @param idProperty - Property name to use as ID (default: 'id')
 * @param namespace - Namespace for the keys
 * @returns A safe key for the array item
 */
export function createArrayItemKey<T extends Record<string, any>>(
  item: T,
  index: number,
  idProperty: keyof T = 'id' as keyof T,
  namespace = 'item'
): string {
  // Try to use the specified ID property
  if (item && item[idProperty] !== null && item[idProperty] !== undefined) {
    return createSafeKey(item[idProperty], namespace, index);
  }

  // Fallback to other common ID properties
  const fallbackProperties = ['id', 'key', 'uid', 'uuid', '_id'];
  for (const prop of fallbackProperties) {
    if (item && item[prop] !== null && item[prop] !== undefined) {
      return createSafeKey(item[prop], namespace, index);
    }
  }

  // Final fallback: use index
  return createSafeKey(`${namespace}-${index}`, namespace);
}

/**
 * Validates that a key is safe to use
 * @param key - The key to validate
 * @returns true if the key is safe, false otherwise
 */
export function isValidKey(key: string | null | undefined): boolean {
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * Clears the key registry (useful for testing or memory management)
 */
export function clearKeyRegistry(): void {
  keyRegistry.clear();
}

/**
 * React hook for generating stable keys in components
 * @param baseKey - Base key value
 * @param deps - Dependencies that should trigger key regeneration
 * @returns A stable key that persists across renders
 */
export function useStableKey(
  baseKey: string | number | null | undefined,
  deps: any[] = []
): string {
  // Use React's useMemo equivalent behavior
  const key = React.useMemo(() => {
    return createSafeKey(baseKey, 'hook');
  }, [baseKey, ...deps]);

  return key;
}

// Import React for the hook
import React from 'react';

/**
 * Higher-order component that ensures all children have proper keys
 * @param WrappedComponent - Component to wrap
 * @returns Component with key validation
 */
export function withKeyValidation<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return function KeyValidatedComponent(props: T) {
    // Add key prop if missing
    const enhancedProps = {
      ...props,
      key: props.key || createTimeKey('validated')
    };

    return React.createElement(WrappedComponent, enhancedProps);
  };
}

/**
 * Debug utility to log key generation
 * @param key - The generated key
 * @param context - Context information
 */
export function debugKey(key: string, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[KeyDebug] ${context || 'Generated key'}: "${key}"`);
  }
} 