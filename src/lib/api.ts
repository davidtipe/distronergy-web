const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface ApiError {
  status: "error";
  message: string;
  errors?: { path: string; message: string }[];
}

export interface ApiSuccess<T = unknown> {
  status: "success";
  data: T;
  message?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        this.accessToken = null;
        return null;
      }
      const data: ApiSuccess<{ accessToken: string }> = await res.json();
      this.accessToken = data.data.accessToken;
      return this.accessToken;
    } catch {
      this.accessToken = null;
      return null;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    // Deduplicate concurrent refresh calls
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshToken().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  async fetch<T = unknown>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiSuccess<T>> {
    const token = await this.getValidToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // If 401, try refreshing the token once
    if (res.status === 401 && token) {
      this.accessToken = null;
      const newToken = await this.getValidToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_URL}${path}`, {
          ...options,
          headers,
          credentials: "include",
        });
      }
    }

    const json = await res.json();

    if (!res.ok) {
      const error = json as ApiError;
      throw new ApiRequestError(
        error.message || "Request failed",
        res.status,
        error.errors
      );
    }

    return json as ApiSuccess<T>;
  }

  async get<T = unknown>(path: string) {
    return this.fetch<T>(path, { method: "GET" });
  }

  async post<T = unknown>(path: string, body?: unknown) {
    return this.fetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(path: string, body?: unknown) {
    return this.fetch<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(path: string, body?: unknown) {
    return this.fetch<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(path: string) {
    return this.fetch<T>(path, { method: "DELETE" });
  }

  async upload<T = unknown>(path: string, formData: FormData) {
    const token = await this.getValidToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok) {
      const error = json as ApiError;
      throw new ApiRequestError(
        error.message || "Upload failed",
        res.status,
        error.errors
      );
    }
    return json as ApiSuccess<T>;
  }
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export const api = new ApiClient();
