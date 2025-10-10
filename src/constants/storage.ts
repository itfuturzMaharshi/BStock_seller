/**
 * Centralized localStorage key constants for BStock Seller project
 * This prevents conflicts when multiple projects run on the same domain
 */

export const STORAGE_KEYS = {
  // Authentication keys
  TOKEN: 'bstock_seller_token',
  USER: 'bstock_seller_user',
  USER_ID: 'bstock_seller_userId',
  USER_TYPE: 'bstock_seller_userType',
  
  // Theme key
  THEME: 'bstock_seller_theme',
  
  // Socket authentication (if different from main token)
  AUTH_TOKEN: 'bstock_seller_auth_token',
} as const;

/**
 * Storage utility functions for consistent localStorage usage
 */
export class StorageService {
  /**
   * Get item from localStorage with error handling
   */
  static getItem<T = string>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage with error handling
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all BStock Seller related items from localStorage
   */
  static clearSellerData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }
}
