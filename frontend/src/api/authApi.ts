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

    forgotPassword: async (email: string): Promise<any> => {
        const response = await apiClient.post('/auth/forgot-password/send-otp', { email });
        return response.data;
    },

    resetPassword: async (data: { email: string; otp: string; newPassword: string }): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/forgot-password/reset', data);
        return response.data;
    },

    sendLoginOtp: async (credentials: { email: string; password: string }): Promise<any> => {
        const response = await apiClient.post('/auth/login/send-otp', credentials);
        return response.data;
    },

    verifyLoginOtp: async (data: { email: string; otp: string }): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login/verify-otp', data);
        return response.data;
    },
};
