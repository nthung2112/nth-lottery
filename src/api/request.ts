import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create({
      baseURL: "/api",
      timeout: 10_000,
      ...config,
    });

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const reponseData = response.data;
        return reponseData;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );
  }

  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.request(config);

    return response.data;
  }
}

function request<T>(config: AxiosRequestConfig): Promise<T> {
  const instance = new Request(config);

  return instance.request(config);
}

export default request;
