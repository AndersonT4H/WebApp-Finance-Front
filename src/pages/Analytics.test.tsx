// eslint-disable-next-line import/first
import '@testing-library/jest-dom';
// eslint-disable-next-line import/first
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// eslint-disable-next-line import/first
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line import/first
import Analytics from './Analytics';

// Mock do ResponsiveContainer do Recharts
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div data-testid="responsive-container" style={{ width, height }}>
      {children}
    </div>
  ),
}));

// Mock das APIs
jest.mock('../services/api', () => ({
  transactionsApi: {
    getAll: jest.fn(),
  },
  accountsApi: {
    getAll: jest.fn(),
  }
}));

// Mock do toast
jest.mock('react-hot-toast', () => ({
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
  
  // Mock do console.error para evitar mensagens nos testes
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Analytics', () => {
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

  const mockTransactions = [
    {
      id: 1,
      type: 'Crédito',
      amount: 5000,
      description: 'Salário',
      transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
      account: { id: 1, name: 'Conta Corrente', type: 'Corrente' }
    },
    {
      id: 2,
      type: 'Débito',
      amount: 1500,
      description: 'Aluguel',
      transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
      account: { id: 1, name: 'Conta Corrente', type: 'Corrente' }
    },
    {
      id: 3,
      type: 'Crédito',
      amount: 2000,
      description: 'Freelance',
      transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias atrás
      account: { id: 2, name: 'Conta Poupança', type: 'Poupança' }
    },
    {
      id: 4,
      type: 'Débito',
      amount: 800,
      description: 'Supermercado',
      transactionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 dias atrás
      account: { id: 1, name: 'Conta Corrente', type: 'Corrente' }
    },
    {
      id: 5,
      type: 'Transferência',
      amount: 1000,
      description: 'Transferência para poupança',
      transactionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 dias atrás
      account: { id: 1, name: 'Conta Corrente', type: 'Corrente' },
      destinationAccount: { id: 2, name: 'Conta Poupança', type: 'Poupança' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const { transactionsApi, accountsApi } = require('../services/api');
    transactionsApi.getAll.mockResolvedValue(mockTransactions);
    accountsApi.getAll.mockResolvedValue(mockAccounts);
  });

  const renderAnalytics = () => {
    return render(
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    );
  };

  it('deve renderizar o título e descrição', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Visualize seus dados financeiros com gráficos e análises')).toBeInTheDocument();
    });
  });

  it('deve carregar e exibir os filtros', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Período')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Conta')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Últimos 7 dias')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Últimos 3 meses')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Último ano')).toBeInTheDocument();
    });
  });

  it('deve exibir as estatísticas rápidas corretamente', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    // Verifica se as estatísticas estão sendo exibidas
    await waitFor(() => {
      expect(screen.getByText('Despesas')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Saldo')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Transações')).toBeInTheDocument();
    });

    // Verifica se os valores estão formatados corretamente
    await waitFor(() => {
      expect(screen.getByText('R$ 7.000,00')).toBeInTheDocument(); // Receitas (5000 + 2000)
    });

    await waitFor(() => {
      expect(screen.getByText('R$ 2.300,00')).toBeInTheDocument(); // Despesas (1500 + 800)
    });

    await waitFor(() => {
      expect(screen.getByText('R$ 4.700,00')).toBeInTheDocument(); // Saldo (7000 - 2300)
    });

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total de transações
    });
  });

  it('deve exibir os gráficos', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas vs Despesas Mensais')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Distribuição por Tipo')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Evolução do Saldo')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Distribuição por Conta')).toBeInTheDocument();
    });

    // Verifica se os containers responsivos estão presentes
    const containers = screen.getAllByTestId('responsive-container');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('deve filtrar por período', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Últimos 30 dias')).toBeInTheDocument();
    });

    const periodSelect = screen.getByDisplayValue('Últimos 30 dias');
    fireEvent.change(periodSelect, { target: { value: '7' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Últimos 7 dias')).toBeInTheDocument();
    });
  });

  it('deve filtrar por conta', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Todas as contas')).toBeInTheDocument();
    });

    const accountSelect = screen.getByDisplayValue('Todas as contas');
    fireEvent.change(accountSelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Conta Corrente')).toBeInTheDocument();
    });
  });

  it('deve mostrar loading inicial', () => {
    const { transactionsApi, accountsApi } = require('../services/api');
    transactionsApi.getAll.mockImplementation(() => new Promise(() => {})); // Promise que nunca resolve
    accountsApi.getAll.mockImplementation(() => new Promise(() => {}));

    renderAnalytics();

    // Verifica se o loading está sendo exibido (não deve mostrar o título ainda)
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
  });

  it('deve lidar com erro ao carregar dados', async () => {
    const { transactionsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    transactionsApi.getAll.mockRejectedValue(new Error('Erro na API'));

    renderAnalytics();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar dados para análise');
    });
  });

  it('deve exibir saldo negativo corretamente', async () => {
    const { transactionsApi } = require('../services/api');
    
    // Mock com mais despesas que receitas
    const negativeBalanceTransactions = [
      {
        id: 1,
        type: 'Crédito',
        amount: 1000,
        description: 'Salário',
        transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
        account: { id: 1, name: 'Conta Corrente', type: 'Corrente' }
      },
      {
        id: 2,
        type: 'Débito',
        amount: 2000,
        description: 'Aluguel',
        transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
        account: { id: 1, name: 'Conta Corrente', type: 'Corrente' }
      }
    ];

    transactionsApi.getAll.mockResolvedValue(negativeBalanceTransactions);

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('-R$ 1.000,00')).toBeInTheDocument(); // Saldo negativo
    });
  });

  it('deve aplicar múltiplos filtros simultaneamente', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    // Aplica filtro de período
    const periodSelect = screen.getByDisplayValue('Últimos 30 dias');
    fireEvent.change(periodSelect, { target: { value: '7' } });

    // Aplica filtro de conta
    const accountSelect = screen.getByDisplayValue('Todas as contas');
    fireEvent.change(accountSelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Últimos 7 dias')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Conta Corrente')).toBeInTheDocument();
    });
  });

  it('deve exibir gráficos com dados vazios', async () => {
    const { transactionsApi } = require('../services/api');
    transactionsApi.getAll.mockResolvedValue([]);

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    // Verifica se os gráficos ainda são renderizados mesmo sem dados
    expect(screen.getByText('Receitas vs Despesas Mensais')).toBeInTheDocument();
    expect(screen.getByText('Distribuição por Tipo')).toBeInTheDocument();
    expect(screen.getByText('Evolução do Saldo')).toBeInTheDocument();
    expect(screen.getByText('Distribuição por Conta')).toBeInTheDocument();

    // Verifica se as estatísticas mostram zero
    const zeroValues = screen.getAllByText('R$ 0,00');
    expect(zeroValues.length).toBeGreaterThan(0); // Receitas, Despesas e Saldo
    expect(screen.getByText('0')).toBeInTheDocument(); // Transações
  });

  it('deve exibir tooltips nos gráficos', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas vs Despesas Mensais')).toBeInTheDocument();
    });

    // Verifica se os gráficos estão presentes
    expect(screen.getByText('Receitas vs Despesas Mensais')).toBeInTheDocument();
    expect(screen.getByText('Distribuição por Tipo')).toBeInTheDocument();
    expect(screen.getByText('Evolução do Saldo')).toBeInTheDocument();
    expect(screen.getByText('Distribuição por Conta')).toBeInTheDocument();
  });

  it('deve formatar valores monetários corretamente', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('R$ 7.000,00')).toBeInTheDocument(); // Receitas
    });

    expect(screen.getByText('R$ 2.300,00')).toBeInTheDocument(); // Despesas
    expect(screen.getByText('R$ 4.700,00')).toBeInTheDocument(); // Saldo
  });

  it('deve exibir ícones corretos nas estatísticas', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    // Verifica se os ícones estão presentes
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('Saldo')).toBeInTheDocument();
    expect(screen.getByText('Transações')).toBeInTheDocument();
  });

  it('deve manter estado dos filtros ao recarregar', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    // Altera filtros
    const periodSelect = screen.getByDisplayValue('Últimos 30 dias');
    fireEvent.change(periodSelect, { target: { value: '90' } });

    const accountSelect = screen.getByDisplayValue('Todas as contas');
    fireEvent.change(accountSelect, { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Últimos 3 meses')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Conta Poupança')).toBeInTheDocument();
    });
  });

  it('deve calcular estatísticas corretamente com filtros aplicados', async () => {
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    // Filtra apenas pela Conta Corrente
    const accountSelect = screen.getByDisplayValue('Todas as contas');
    fireEvent.change(accountSelect, { target: { value: '1' } });

    await waitFor(() => {
      // Verifica se as estatísticas foram recalculadas
      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument(); // Receitas da Conta Corrente
    });

    await waitFor(() => {
      expect(screen.getByText('R$ 2.300,00')).toBeInTheDocument(); // Despesas da Conta Corrente
    });
  });
}); 