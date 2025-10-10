# BStock Seller - Centralized Storage Constants Implementation

## Overview
This implementation centralizes all localStorage keys for the BStock Seller project to prevent conflicts when multiple projects run on the same domain. All localStorage operations now use consistent, prefixed keys.

## Files Created/Modified

### 1. New Constants File
**File:** `src/constants/storage.ts`
- Centralized storage key constants with `bstock_seller_` prefix
- StorageService utility class for consistent localStorage operations
- Error handling for localStorage operations
- Type-safe storage operations

### 2. Updated Files

#### Authentication Services
- **`src/services/auth/auth.services.ts`**
  - Updated `persistSession()` and `clearSession()` functions
  - Now uses `STORAGE_KEYS.TOKEN` and `STORAGE_KEYS.USER`

#### API Services  
- **`src/services/api/api.ts`**
  - Updated request interceptor to use `STORAGE_KEYS.TOKEN`
  - Updated error handling to use new storage constants

#### Context Providers
- **`src/context/SocketProvider.tsx`**
  - Updated to use `STORAGE_KEYS.USER_ID` and `STORAGE_KEYS.USER_TYPE`
  
- **`src/context/ThemeContext.tsx`**
  - Updated to use `STORAGE_KEYS.THEME`

#### Components
- **`src/components/UserProfile/UserInfoCard.tsx`**
  - Updated localStorage operations to use new constants
  - Fixed TypeScript typing issues

- **`src/components/common/SocketDemo.tsx`**
  - Updated to use `STORAGE_KEYS.AUTH_TOKEN`

#### Pages
- **`src/pages/UserProfiles.tsx`**
  - Updated localStorage operations to use new constants
  - Fixed TypeScript typing issues

- **`src/pages/AuthPages/VerifyEmail.tsx`**
  - Updated to use `STORAGE_KEYS.TOKEN`

## Storage Keys Used

```typescript
export const STORAGE_KEYS = {
  // Authentication keys
  TOKEN: 'bstock_seller_token',
  USER: 'bstock_seller_user',
  USER_ID: 'bstock_seller_userId',
  USER_TYPE: 'bstock_seller_userType',
  
  // Theme key
  THEME: 'bstock_seller_theme',
  
  // Socket authentication
  AUTH_TOKEN: 'bstock_seller_auth_token',
} as const;
```

## Benefits

1. **No Domain Conflicts**: All keys are prefixed with `bstock_seller_` to prevent conflicts with other projects
2. **Centralized Management**: All storage keys are defined in one place
3. **Type Safety**: TypeScript support for storage operations
4. **Error Handling**: Built-in error handling for localStorage operations
5. **Consistency**: All localStorage operations now use the same pattern
6. **Easy Maintenance**: Changes to storage keys only need to be made in one file

## Usage Example

```typescript
import { STORAGE_KEYS, StorageService } from '../constants/storage';

// Get data
const user = StorageService.getItem(STORAGE_KEYS.USER);

// Set data
StorageService.setItem(STORAGE_KEYS.USER, userData);

// Remove data
StorageService.removeItem(STORAGE_KEYS.TOKEN);

// Clear all seller data
StorageService.clearSellerData();
```

## Migration Notes

- All existing localStorage operations have been updated
- No breaking changes to the API
- Backward compatibility maintained
- All TypeScript errors resolved
