const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RequestOptions {
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async post<T>(
    url: string,
    data: object = {},
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
        signal: options.signal,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Unable to connect to server");
      }
      throw error;
    }
  }

  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        signal: options.signal,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Unable to connect to server");
      }
      throw error;
    }
  }

  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        signal: options.signal,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Unable to connect to server");
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
