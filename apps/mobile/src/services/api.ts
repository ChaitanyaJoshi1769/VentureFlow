import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

class ApiService {
  private client: AxiosInstance;
  private baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ventureflow.io/api/v1';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string, deviceId: string) {
    const response = await this.client.post('/mobile/login', {
      email,
      password,
      deviceId,
    });
    await SecureStore.setItemAsync('auth_token', response.data.tokens.accessToken);
    await SecureStore.setItemAsync('refresh_token', response.data.tokens.refreshToken);
    return response.data;
  }

  async biometricLogin(userId: string, deviceId: string, biometricToken: string) {
    const response = await this.client.post('/mobile/biometric-login', {
      userId,
      deviceId,
      biometricToken,
    });
    await SecureStore.setItemAsync('auth_token', response.data.accessToken);
    return response.data;
  }

  async getInvestors(page = 1, pageSize = 20) {
    return this.client.get('/investors', {
      params: { page, pageSize },
    });
  }

  async getInvestor(id: string) {
    return this.client.get(`/investors/${id}`);
  }

  async getStartups(page = 1, pageSize = 20) {
    return this.client.get('/startups', {
      params: { page, pageSize },
    });
  }

  async getPipeline() {
    return this.client.get('/crm/pipeline');
  }

  async getOfflineData() {
    return this.client.get('/mobile/offline-sync');
  }

  async registerPushDevice(deviceToken: string, deviceType: 'ios' | 'android') {
    return this.client.post('/push-notifications/register-device', {
      deviceToken,
      deviceType,
    });
  }

  async logout() {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }
}

export default new ApiService();
