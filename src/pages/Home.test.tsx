import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
jest.mock('lottie-react', () => () => <div data-testid="lottie-mock" />);

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

describe('Home', () => {
  it('deve renderizar o título principal', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(
      screen.getAllByText((content, element) =>
        !!element?.textContent?.toLowerCase().includes('controle suas finanças')
      ).length
    ).toBeGreaterThan(0);
  });

  it('deve renderizar o botão de acesso ao sistema', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /acessar o sistema/i })).toBeInTheDocument();
  });
}); 