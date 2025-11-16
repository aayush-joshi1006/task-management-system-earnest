import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE = API_ROOT.replace(/\/$/, '') ;

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshQueue: Array<[(token: string | null) => void, (err: any) => void]> = [];

  constructor() {
    this.client = axios.create({ baseURL: API_BASE, withCredentials: true });

    this.client.interceptors.request.use((cfg) => {
      if (this.accessToken) {
        cfg.headers = cfg.headers ?? {};
        cfg.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      return cfg;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;
        if (!original) return Promise.reject(err);
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const token = await this._refreshToken();
            if (!token) {
              // no session (refresh failed) — don't retry, let app handle logout
              return Promise.reject(err);
            }
            this.setAccessToken(token);
            original.headers = original.headers ?? {};
            original.headers['Authorization'] = `Bearer ${token}`;
            return this.client(original);
          } catch (e) {
            return Promise.reject(e);
          }
        }
        return Promise.reject(err);
      }
    );
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async _refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((res, rej) => this.refreshQueue.push([res, rej]));
    }
    this.isRefreshing = true;
    try {
      const r = await this.client.post('/auth/refresh');
      const token = r.data?.accessToken ?? null;
      this.refreshQueue.forEach(([res]) => res(token));
      this.refreshQueue = [];
      return token;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // treat as no session
        this.setAccessToken(null);
        this.refreshQueue.forEach(([res]) => res(null));
        this.refreshQueue = [];
        return null;
      }
      this.refreshQueue.forEach(([_, rej]) => rej(err));
      this.refreshQueue = [];
      throw err;
    } finally {
      this.isRefreshing = false;
    }
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }
  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch(url, data, config);
  }
  delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }
}

const api = new ApiClient();
export default api;
