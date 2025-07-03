import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountForm from './AccountForm';

// Faz um mock do módulo de API para evitar chamadas reais durante os testes
jest.mock('../services/api', () => ({
  accountsApi: {
    getAll: jest.fn().mockResolvedValue([]), // Retorna lista vazia de contas
    getById: jest.fn().mockResolvedValue({ id: 1, name: 'Conta Teste', type: 'Corrente', balance: 0, createdAt: new Date().toISOString() }), // Mock de conta para edição
    create: jest.fn().mockResolvedValue({}), // Simula criação bem-sucedida
    update: jest.fn().mockResolvedValue({}), // Simula atualização bem-sucedida
    delete: jest.fn().mockResolvedValue({}), // Simula exclusão bem-sucedida
    getStatistics: jest.fn().mockResolvedValue({}), // Simula estatísticas
  }
}));

// Antes de todos os testes, faz um mock do console.warn para ignorar avisos específicos do React Router
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

// Após todos os testes, restaura o comportamento original dos mocks do jest
afterAll(() => {
  jest.restoreAllMocks();
});

// Mock do useNavigate e useParams para evitar navegação real e simular criação
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(), // Mock da função de navegação
  useParams: () => ({}), // Simula criação (não edição)
}));

// Início do bloco de testes do componente AccountForm
describe('AccountForm', () => {
  // Testa se o formulário de nova conta é renderizado corretamente
  it('deve renderizar o formulário de nova conta', () => {
    render(
      <MemoryRouter>
        <AccountForm />
      </MemoryRouter>
    );
    // Verifica se os campos obrigatórios estão presentes na tela
    expect(screen.getByLabelText(/nome da conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo da conta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  // Testa se o formulário mostra mensagens de erro ao tentar submeter sem preencher os campos obrigatórios
  it('deve mostrar erro se tentar submeter sem preencher campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <AccountForm />
      </MemoryRouter>
    );
    // Clica no botão de criar conta sem preencher os campos
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    // Espera e verifica se as mensagens de erro aparecem na tela
    expect(await screen.findByText(/nome da conta é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/tipo da conta é obrigatório/i)).toBeInTheDocument();
  });
});