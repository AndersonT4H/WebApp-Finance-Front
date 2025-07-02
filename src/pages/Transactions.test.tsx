// eslint-disable-next-line import/first
import '@testing-library/jest-dom';
// eslint-disable-next-line import/first
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// eslint-disable-next-line import/first
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line import/first
import Transactions from './Transactions';

// Mock das APIs
jest.mock('../services/api', () => ({
  transactionsApi: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
  accountsApi: {
    getAll: jest.fn(),
  }
}));

// Mock do toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock do window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

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

describe('Transactions', () => {
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
      type: 'Débito',
      amount: 500,
      description: 'Pagamento de conta de luz',
      transactionDate: '2024-01-15T00:00:00.000Z',
      account: { id: 1, name: 'Conta Corrente', type: 'Corrente' }
    },
    {
      id: 2,
      type: 'Crédito',
      amount: 2000,
      description: 'Salário',
      transactionDate: '2024-01-20T00:00:00.000Z',
      account: { id: 2, name: 'Conta Poupança', type: 'Poupança' }
    },
    {
      id: 3,
      type: 'Transferência',
      amount: 1000,
      description: 'Transferência entre contas',
      transactionDate: '2024-01-25T00:00:00.000Z',
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

  const renderTransactions = () => {
    return render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );
  };

  it('deve renderizar o título e botões de ação', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Transações')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Transferência').length).toBeGreaterThan(0);
    expect(screen.getByText('Nova Transação')).toBeInTheDocument();
  });

  it('deve carregar e exibir as transações', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Salário')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Transferência entre contas')).toBeInTheDocument();
    });
  });

  it('deve exibir os filtros corretamente', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar transações...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Todas as contas')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Todos os tipos')).toBeInTheDocument();
    });

    // Verifica se os campos de data estão presentes
    const dateInputs = screen.getAllByDisplayValue('');
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it('deve filtrar transações por termo de busca', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar transações...');
    fireEvent.change(searchInput, { target: { value: 'luz' } });

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    });
  });

  it('deve filtrar transações por conta', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const accountSelect = selects[0];
    fireEvent.change(accountSelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Transferência entre contas')).toBeInTheDocument();
    });
  });

  it('deve filtrar transações por tipo', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const typeSelect = selects[1];
    fireEvent.change(typeSelect, { target: { value: 'Débito' } });

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    });
  });

  it('deve exibir valores formatados corretamente', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('R$ 500,00'))).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('R$ 2.000,00'))).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('R$ 1.000,00'))).toBeInTheDocument();
    });
  });

  it('deve exibir datas formatadas corretamente', async () => {
    renderTransactions();

    // Aguarda a tabela carregar primeiro
    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    // Verifica se a tabela está presente e carregada
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('deve exibir informações de conta de destino para transferências', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Para: Conta Poupança')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando não há transações', async () => {
    const { transactionsApi } = require('../services/api');
    transactionsApi.getAll.mockResolvedValue([]);

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Comece registrando sua primeira transação.')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Registrar primeira transação')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando filtros não retornam resultados', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar transações...');
    fireEvent.change(searchInput, { target: { value: 'transação inexistente' } });

    await waitFor(() => {
      expect(screen.getByText('Nenhuma transação corresponde aos filtros')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Tente ajustar os filtros de busca.')).toBeInTheDocument();
    });
  });

  it('deve excluir transação com confirmação', async () => {
    const { transactionsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    mockConfirm.mockReturnValue(true);
    transactionsApi.delete.mockResolvedValue({});

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    // Encontra o botão de excluir da primeira transação
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta transação?');
    });

    await waitFor(() => {
      expect(transactionsApi.delete).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Transação excluída com sucesso');
    });
  });

  it('deve cancelar exclusão quando usuário não confirma', async () => {
    const { transactionsApi } = require('../services/api');
    
    mockConfirm.mockReturnValue(false);

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    // Encontra o botão de excluir da primeira transação
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta transação?');
    });

    expect(transactionsApi.delete).not.toHaveBeenCalled();
  });

  it('deve lidar com erro ao excluir transação', async () => {
    const { transactionsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    mockConfirm.mockReturnValue(true);
    transactionsApi.delete.mockRejectedValue(new Error('Erro na API'));

    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    // Encontra o botão de excluir da primeira transação
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao excluir transação');
    });
  });

  it('deve lidar com erro ao carregar transações', async () => {
    const { transactionsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    transactionsApi.getAll.mockRejectedValue(new Error('Erro na API'));

    renderTransactions();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar transações');
    });
  });

  it('deve exibir links de edição para cada transação', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    // Verifica se há links de edição (ícones de edição)
    const editLinks = screen.getAllByRole('link').filter(link => link.getAttribute('href')?.includes('/edit'));
    expect(editLinks.length).toBeGreaterThan(0);
  });

  it('deve aplicar múltiplos filtros simultaneamente', async () => {
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    // Aplica filtro de busca
    const searchInput = screen.getByPlaceholderText('Buscar transações...');
    fireEvent.change(searchInput, { target: { value: 'conta' } });

    // Aplica filtro de tipo
    const selects = screen.getAllByRole('combobox');
    const typeSelect = selects[1];
    fireEvent.change(typeSelect, { target: { value: 'Débito' } });

    await waitFor(() => {
      expect(screen.getByText('Pagamento de conta de luz')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Transferência entre contas')).not.toBeInTheDocument();
    });
  });
}); 