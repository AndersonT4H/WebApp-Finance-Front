import axios from 'axios';
import { 
  Account, 
  Transaction, 
  CreateAccountData, 
  UpdateAccountData, 
  CreateTransactionData, 
  UpdateTransactionData,
  AccountStatistics,
  TransactionStatistics,
  ApiResponse 
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Erro interno do servidor';
    throw new Error(message);
  }
);

// Contas
export const accountsApi = {
  // Listar todas as contas
  getAll: async (): Promise<Account[]> => {
    const response = await api.get<ApiResponse<Account[]>>('/accounts');
    return response.data.data;
  },

  // Buscar conta por ID
  getById: async (id: number): Promise<Account> => {
    const response = await api.get<ApiResponse<Account>>(`/accounts/${id}`);
    return response.data.data;
  },

  // Criar nova conta
  create: async (data: CreateAccountData): Promise<Account> => {
    const response = await api.post<ApiResponse<Account>>('/accounts', data);
    return response.data.data;
  },

  // Atualizar conta
  update: async (id: number, data: UpdateAccountData): Promise<Account> => {
    const response = await api.put<ApiResponse<Account>>(`/accounts/${id}`, data);
    return response.data.data;
  },

  // Remover conta
  delete: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/accounts/${id}`);
  },

  // Estatísticas das contas
  getStatistics: async (): Promise<AccountStatistics> => {
    const response = await api.get<ApiResponse<AccountStatistics>>('/accounts/statistics');
    return response.data.data;
  },

  // Saldo total
  getTotalBalance: async (): Promise<{ totalBalance: number }> => {
    const response = await api.get<ApiResponse<{ totalBalance: number }>>('/accounts/total-balance');
    return response.data.data;
  },

  // Contas por tipo
  getByType: async (type: string): Promise<Account[]> => {
    const response = await api.get<ApiResponse<Account[]>>(`/accounts/type/${type}`);
    return response.data.data;
  },
};

// Transações
export const transactionsApi = {
  // Listar todas as transações
  getAll: async (params?: {
    accountId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return response.data.data;
  },

  // Buscar transação por ID
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data;
  },

  // Criar nova transação
  create: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data.data;
  },

  // Atualizar transação
  update: async (id: number, data: UpdateTransactionData): Promise<Transaction> => {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data.data;
  },

  // Remover transação
  delete: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/transactions/${id}`);
  },

  // Realizar transferência
  transfer: async (data: {
    amount: number;
    description: string;
    accountId: number;
    destinationAccountId: number;
  }): Promise<Transaction> => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/transfer', data);
    return response.data.data;
  },

  // Transações por conta
  getByAccount: async (accountId: number): Promise<Transaction[]> => {
    const response = await api.get<ApiResponse<Transaction[]>>(`/transactions/account/${accountId}`);
    return response.data.data;
  },

  // Estatísticas das transações
  getStatistics: async (params?: {
    accountId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionStatistics> => {
    const response = await api.get<ApiResponse<TransactionStatistics>>('/transactions/statistics', { params });
    return response.data.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ message: string; timestamp: string; environment: string }> => {
    const response = await api.get<ApiResponse<{ message: string; timestamp: string; environment: string }>>('/health');
    return response.data.data;
  },
};

export default api; 