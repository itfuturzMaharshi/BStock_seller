import toastHelper from '../../utils/toastHelper';
import api from "../api/api";
import { env } from '../../utils/env';

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  data?: {
    token?: string;
    customer?: User;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  socialId?: string;
  platformName?: string;
  mobileNumber?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  socialId?: string;
  platformName?: string;
}

export class EmailNotVerifiedError extends Error {
  constructor(message = "Email is not verified. Please check your inbox.") {
    super(message);
    this.name = "EmailNotVerifiedError";
  }
}

function persistSession(token?: string, user?: User): void {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export class AuthService {
  // Register a new seller
  static register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const baseUrl = env.baseUrl;
    const url = `${baseUrl}/api/seller/register`;

    try {
      const res = await api.post(url, userData);
      toastHelper.showTost(res.data.message || 'Registration successful!', 'success');
      return res.data as AuthResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to register';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  // Resend verification email
  static resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
    const baseUrl = env.baseUrl;
    // Prefer configured paths first, then try some common guesses
    const candidatePaths = [
      ...env.resendVerificationPaths,
      '/api/seller/verify-email/resend',
      '/api/seller/resend-verification-email',
      '/api/seller/resend-verification',
      '/api/seller/send-verification-email',
      '/api/auth/resend-verification',
    ];

    let lastError: any = null;
    for (const path of candidatePaths) {
      const url = `${baseUrl}${path}`;
      // Try POST first
      try {
        const res = await api.post(url, { email });
        const data: AuthResponse = res.data;
        toastHelper.showTost(data.message || 'Verification email sent', 'success');
        return data;
      } catch (postErr: any) {
        // Try GET as a fallback regardless of error status
        try {
          const getUrl = `${url}?email=${encodeURIComponent(email)}`;
          const res = await api.get(getUrl);
          const data: AuthResponse = res.data;
          toastHelper.showTost(data.message || 'Verification email sent', 'success');
          return data;
        } catch (getErr: any) {
          lastError = getErr || postErr;
          // Move to next candidate path
          continue;
        }
      }
    }

    const fallbackMessage = lastError?.response?.data?.message || 'Verification email endpoint not available';
    toastHelper.showTost(fallbackMessage, 'error');
    throw new Error(fallbackMessage);
  };

  // Verify email for seller
  static verifyEmail = async (token: string): Promise<AuthResponse> => {
    const baseUrl = env.baseUrl;
    const url = `${baseUrl}/api/seller/verify-email/${token}`;
    
    try {
      const res = await api.get(url);
      toastHelper.showTost(res.data.message || 'Email verified successfully!', 'success');
      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify email';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  // Login seller
  static login = async (loginData: LoginRequest): Promise<AuthResponse> => {
    const baseUrl = env.baseUrl;
    const url = `${baseUrl}/api/seller/login`;

    try {
      const res = await api.post(url, loginData);
      const data: AuthResponse = res.data;
      const user = data?.data?.customer;
      const token = data?.data?.token;

      // If backend indicates email not verified, surface a specific error
      const backendMessage = (res as any)?.data?.message?.toString().toLowerCase() || '';
      if (backendMessage.includes('verify') && backendMessage.includes('email')) {
        throw new EmailNotVerifiedError(data.message);
      }

      if (data.status === 200 && token && user) {
        clearSession();
        persistSession(token, user);
        toastHelper.showTost(data.message || 'Login successful!', 'success');
        return data;
      }

      // Non-200 or missing token/user
      const warnMessage = data.message || 'Invalid credentials';
      toastHelper.showTost(warnMessage, 'warning');
      return data;

    } catch (err: any) {
      if (err instanceof EmailNotVerifiedError) {
        throw err;
      }
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to login';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };
}


