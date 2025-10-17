import api from "../api/api";
import { env } from "../../utils/env";
import toastHelper from "../../utils/toastHelper";

export interface ProductVersion {
  _id?: string;
  id?: string;
  specification: string;
  name: string;
  skuFamilyId?: { name?: string; _id?: string; id?: string } | string | null;
  subSkuFamilyId?: { name?: string; _id?: string; id?: string } | string | null;
  simType: string;
  color: string;
  ram: string;
  storage: string;
  condition: string;
  price: number;
  stock: number;
  country: string;
  moq: number;
  isNegotiable: boolean;
  isFlashDeal: boolean;
  expiryTime: string;
  isVerified: boolean;
  isApproved: boolean;
  canVerify: boolean;
  canApprove: boolean;
  purchaseType: string;
  versionNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryRequest {
  page?: number;
  limit?: number;
  productId?: string;
}

export interface GetVersionRequest {
  productId: string;
}

export interface RestoreVersionRequest {
  productId: string;
  version: number | string;
}

export interface VersionCountRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

export interface VersionCountResponse {
  productId: string;
  productName: string;
  versionCount: number;
  latestVersion: ProductVersion;
}

export class ProductVersionService {

  static getHistory = async (payload: HistoryRequest): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/version/product/history`;
    try {
      const { page, limit, productId } = payload || {};
      const res = await api.post(url, { page, limit, productId });
      const data: ApiResponse = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch product history";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };


  static getVersions = async (payload: GetVersionRequest): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/version/product/get`;
    try {
      const res = await api.post(url, payload);
      const data: ApiResponse = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch product versions";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };

  static restoreVersion = async (payload: RestoreVersionRequest): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/version/product/restore`;
    try {
      const res = await api.post(url, payload);
      const data: ApiResponse = res.data;
      toastHelper.showTost(
        data.message || "Product version restored successfully",
        "success"
      );
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to restore product version";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };


  static getProductsWithCounts = async (payload: VersionCountRequest): Promise<ApiResponse<VersionCountResponse[]>> => {
    const url = `${env.baseUrl}/api/seller/version/products-with-counts`;
    try {
      const res = await api.post(url, payload);
      const data: ApiResponse<VersionCountResponse[]> = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch products with version counts";
      toastHelper.showTost(errorMessage, "error");
      throw new Error(errorMessage);
    }
  };


  static saveVersionHistory = async (productData: ProductVersion): Promise<ApiResponse> => {
    const url = `${env.baseUrl}/api/seller/version/product/save-history`;
    try {
      const res = await api.post(url, productData);
      const data: ApiResponse = res.data;
      return data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save product version history";
      // Don't show error toast for history saving as it's not critical
      console.warn("Failed to save version history:", errorMessage);
      throw new Error(errorMessage);
    }
  };
}
