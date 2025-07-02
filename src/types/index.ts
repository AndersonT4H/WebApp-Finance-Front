export interface Account {
  id: number;
  name: string;
  type: 'Corrente' | 'Poupança' | 'Crédito' | 'Investimento';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  type: 'Débito' | 'Crédito' | 'Transferência';
  amount: number;
  description: string;
  transactionDate: string;
  account: Account;
  destinationAccount?: Account;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  name: string;
  type: 'Corrente' | 'Poupança' | 'Crédito' | 'Investimento';
  initialBalance?: number;
}

export interface UpdateAccountData {
  name?: string;
  type?: 'Corrente' | 'Poupança' | 'Crédito' | 'Investimento';
}

export interface CreateTransactionData {
  type: 'Débito' | 'Crédito' | 'Transferência';
  amount: number;
  description: string;
  accountId: number;
  destinationAccountId?: number;
  transactionDate?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  description?: string;
  transactionDate?: string;
}

export interface AccountStatistics {
  totalAccounts: number;
  totalBalance: number;
  accountsByType: {
    type: string;
    count: number;
    totalBalance: number;
  }[];
}

export interface TransactionStatistics {
  totalTransactions: number;
  totalAmount: number;
  byType: {
    [key: string]: {
      count: number;
      totalAmount: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
} 