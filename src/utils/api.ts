export interface SellerProductApiDoc {
  id: string;
  color: string;
  condition: string;
  country: string;
  moq: string;
  price: string;
  canVerify: boolean;
  canApprove: boolean;
}

export interface SellerProductListResponse {
  status: number;
  message: string;
  data: {
    docs: SellerProductApiDoc[];
    totalDocs: string;
    limit: string;
    totalPages: string;
    page: string;
    pagingCounter: string;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

const BASE_URL = "http://localhost:3200";

export async function fetchSellerProducts(page: number = 1, limit: number = 10): Promise<SellerProductListResponse> {
  const url = `${BASE_URL}/api/seller/product/list?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as SellerProductListResponse;
  return json;
}


