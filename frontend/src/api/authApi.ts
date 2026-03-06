import apiClient from './apiClient';

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'COMPLIANCE_OFFICER' | 'CREDIT_MANAGER' | 'CREDIT_OFFICER' | 'RISK_ANALYST' | 'VIEWER';
}

export interface AuthResponse {
    token: string;
    userId: number;
    email: string;
    role: string;
    name: string;
}

export const authApi = {
    login: async (credentials: any): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: any): Promise<string> => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<string> => {
        const response = await apiClient.post(`/auth/forgot-password?email=${email}`);
        return response.data;
    },
};
