/**
 * Utility functions for Firestore operations
 */

/**
 * Recursively removes undefined values from an object before sending to Firestore
 * Firestore doesn't support undefined values, so we need to filter them out
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        const cleanedNested = cleanFirestoreData(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key as keyof T] = cleanedNested as T[keyof T];
        }
      } else if (Array.isArray(value)) {
        // Clean arrays by filtering out undefined values and cleaning nested objects
        const cleanedArray = value
          .filter(item => item !== undefined)
          .map(item => {
            if (item && typeof item === 'object' && !(item instanceof Date)) {
              return cleanFirestoreData(item);
            }
            return item;
          });
        
        if (cleanedArray.length > 0) {
          cleaned[key as keyof T] = cleanedArray as T[keyof T];
        }
      } else {
        cleaned[key as keyof T] = value;
      }
    }
  }
  
  return cleaned;
}

/**
 * Safely converts Firestore timestamp to Date, handling various input types
 */
export function convertFirestoreDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  
  try {
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? undefined : date;
    }
    
    return undefined;
  } catch (error) {
    console.warn('Error converting Firestore date:', error);
    return undefined;
  }
} 