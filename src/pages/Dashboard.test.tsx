// eslint-disable-next-line import/first
import '@testing-library/jest-dom';
// eslint-disable-next-line import/first
import { render, screen, waitFor } from '@testing-library/react';
// eslint-disable-next-line import/first
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line import/first
import Dashboard from './Dashboard';

// Mock do useNavigate para evitar navegação real
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock das APIs
jest.mock('../services/api', () => ({
  accountsApi: {
    getAll: jest.fn(),
    getStatistics: jest.fn(),
  },
  transactionsApi: {
    getAll: jest.fn(),
    getStatistics: jest.fn(),
  }
}));

// Mock do toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (
      typeof msg === 'string' &&
      msg.includes('React Router Future Flag Warning')
    ) {
      return;
    }
    console.warn(msg);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Dashboard', () => {
  const mockAccounts = [
    {
      id: 1,
      name: 'Conta Corrente',
      type: 'Corrente',
      balance: 5000,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Conta Poupança',
      type: 'Poupança',
      balance: 10000,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const mockAccountStats = {
    totalBalance: 15000,
    totalAccounts: 2,
    accountsByType: {
      'Corrente': 1,
      'Poupança': 1
    }
  };

  const mockTransactionStats = {
    totalTransactions: 5,
    totalAmount: 2500,
    transactionsByType: {
      'Crédito': 3,
      'Débito': 2
    }
  };

  const mockTransactions = [
    {
      id: 1,
      description: 'Salário',
      amount: 3000,
      type: 'Crédito',
      transactionDate: '2024-01-15T00:00:00.000Z',
      account: { name: 'Conta Corrente' }
    },
    {
      id: 2,
      description: 'Compras',
      amount: 500,
      type: 'Débito',
      transactionDate: '2024-01-16T00:00:00.000Z',
      account: { name: 'Conta Corrente' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título do dashboard', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue(mockAccounts);
    accountsApi.getStatistics.mockResolvedValue(mockAccountStats);
    transactionsApi.getAll.mockResolvedValue(mockTransactions);
    transactionsApi.getStatistics.mockResolvedValue(mockTransactionStats);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });

  it('deve mostrar loading inicialmente', () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    // Mock das APIs para demorar
    accountsApi.getAll.mockImplementation(() => new Promise(() => {}));
    accountsApi.getStatistics.mockImplementation(() => new Promise(() => {}));
    transactionsApi.getAll.mockImplementation(() => new Promise(() => {}));
    transactionsApi.getStatistics.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verifica se o loading está sendo mostrado (usando classe CSS)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('deve exibir estatísticas corretamente', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue(mockAccounts);
    accountsApi.getStatistics.mockResolvedValue(mockAccountStats);
    transactionsApi.getAll.mockResolvedValue(mockTransactions);
    transactionsApi.getStatistics.mockResolvedValue(mockTransactionStats);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verifica se as estatísticas são exibidas
    await waitFor(() => {
      expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument(); // Saldo total
    });
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total de contas
    });
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total de transações
    });
    
    await waitFor(() => {
      expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument(); // Valor total
    });
  });

  it('deve exibir lista de contas', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue(mockAccounts);
    accountsApi.getStatistics.mockResolvedValue(mockAccountStats);
    transactionsApi.getAll.mockResolvedValue(mockTransactions);
    transactionsApi.getStatistics.mockResolvedValue(mockTransactionStats);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verifica se as contas são exibidas usando getAllByText para elementos duplicados
    await waitFor(() => {
      const contaCorrenteElements = screen.getAllByText('Conta Corrente');
      expect(contaCorrenteElements.length).toBeGreaterThan(0);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Conta Poupança')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument();
    });
  });

  it('deve exibir transações recentes', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue(mockAccounts);
    accountsApi.getStatistics.mockResolvedValue(mockAccountStats);
    transactionsApi.getAll.mockResolvedValue(mockTransactions);
    transactionsApi.getStatistics.mockResolvedValue(mockTransactionStats);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verifica se as transações são exibidas
    await waitFor(() => {
      expect(screen.getByText('Salário')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('+R$ 3.000,00')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('-R$ 500,00')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando não há contas', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue([]);
    accountsApi.getStatistics.mockResolvedValue({ totalBalance: 0, totalAccounts: 0, accountsByType: {} });
    transactionsApi.getAll.mockResolvedValue([]);
    transactionsApi.getStatistics.mockResolvedValue({ totalTransactions: 0, totalAmount: 0, transactionsByType: {} });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma conta cadastrada')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando não há transações', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue(mockAccounts);
    accountsApi.getStatistics.mockResolvedValue(mockAccountStats);
    transactionsApi.getAll.mockResolvedValue([]);
    transactionsApi.getStatistics.mockResolvedValue({ totalTransactions: 0, totalAmount: 0, transactionsByType: {} });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
    });
  });

  it('deve exibir links de navegação', async () => {
    const { accountsApi, transactionsApi } = require('../services/api');
    
    accountsApi.getAll.mockResolvedValue(mockAccounts);
    accountsApi.getStatistics.mockResolvedValue(mockAccountStats);
    transactionsApi.getAll.mockResolvedValue(mockTransactions);
    transactionsApi.getStatistics.mockResolvedValue(mockTransactionStats);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nova Conta')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Nova Transação')).toBeInTheDocument();
    });
    
    // Usa getAllByText para "Ver todas" pois há múltiplos elementos
    await waitFor(() => {
      const verTodasElements = screen.getAllByText('Ver todas');
      expect(verTodasElements.length).toBeGreaterThan(0);
    });
  });

  it('deve lidar com erro na API', async () => {
    const { accountsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    // Mock do console.error para evitar mensagem no console
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    accountsApi.getAll.mockRejectedValue(new Error('Erro na API'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar dados do dashboard');
    });

    // Restaura o console.error
    consoleSpy.mockRestore();
  });
}); 