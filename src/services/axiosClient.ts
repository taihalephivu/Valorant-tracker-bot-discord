import axios, { AxiosInstance } from 'axios';

/**
 * Singleton Axios instance để tránh tạo mới mỗi lần
 * Giúp tiết kiệm memory và tái sử dụng connection pool
 */
let axiosInstance: AxiosInstance | null = null;

export function getAxiosInstance(apiKey?: string): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: 'https://api.henrikdev.xyz/valorant',
      headers: {
        'Accept': 'application/json',
        ...(apiKey && { 'Authorization': apiKey })
      },
      timeout: 15000,
      maxRedirects: 2,
      validateStatus: (status) => status < 500,
      maxContentLength: 10000000,
      maxBodyLength: 10000000,
      // Connection pooling để tái sử dụng connections
      httpAgent: null,
      httpsAgent: null
    });
  }
  return axiosInstance;
}

// Reset instance (dùng khi cần update API key)
export function resetAxiosInstance(): void {
  axiosInstance = null;
}
