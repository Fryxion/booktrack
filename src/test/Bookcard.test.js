import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BookCard from '../BookCard';

// Helper para renderizar com Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BookCard Component', () => {
  const mockBookDisponivel = {
    id_livro: 1,
    titulo: 'O Principezinho',
    autor: 'Antoine de Saint-Exupéry',
    categoria: 'Ficção',
    isbn: '978-0156012195',
    copias_disponiveis: 3,
    total_copias: 5
  };

  const mockBookIndisponivel = {
    id_livro: 2,
    titulo: '1984',
    autor: 'George Orwell',
    categoria: 'Distopia',
    isbn: '978-0451524935',
    copias_disponiveis: 0,
    total_copias: 2
  };

  describe('Renderização Básica', () => {
    it('deve renderizar o título do livro', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      expect(screen.getByText('O Principezinho')).toBeInTheDocument();
    });

    it('deve renderizar o autor do livro', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      expect(screen.getByText('Antoine de Saint-Exupéry')).toBeInTheDocument();
    });

    it('deve renderizar a categoria do livro', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      expect(screen.getByText('Ficção')).toBeInTheDocument();
    });

    it('deve renderizar o link "Ver Detalhes"', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const link = screen.getByText(/Ver Detalhes/i);
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/books/1');
    });
  });

  describe('Indicador de Disponibilidade', () => {
    it('deve mostrar badge verde quando livro está disponível', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const badge = screen.getByText(/3 disponível/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('deve mostrar badge vermelho quando livro está indisponível', () => {
      renderWithRouter(<BookCard book={mockBookIndisponivel} />);
      
      const badge = screen.getByText(/Indisponível/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('deve mostrar número de cópias disponíveis quando > 0', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      expect(screen.getByText(/3 disponível/i)).toBeInTheDocument();
    });

    it('deve mostrar mensagem "Indisponível" quando cópias = 0', () => {
      renderWithRouter(<BookCard book={mockBookIndisponivel} />);
      
      expect(screen.getByText('Indisponível')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('link "Ver Detalhes" deve ter href correto', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const link = screen.getByText(/Ver Detalhes/i).closest('a');
      expect(link).toHaveAttribute('href', '/books/1');
    });

    it('deve aplicar hover effect no card', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const card = screen.getByText('O Principezinho').closest('div');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('deve manter transição suave ao fazer hover', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const card = screen.getByText('O Principezinho').closest('div');
      expect(card).toHaveClass('transition');
    });
  });

  describe('Estilos e Classes CSS', () => {
    it('card deve ter background branco e bordas arredondadas', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const card = screen.getByText('O Principezinho').closest('div');
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md');
    });

    it('título deve ter tamanho de fonte correto', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const titulo = screen.getByText('O Principezinho');
      expect(titulo).toHaveClass('text-lg', 'font-semibold');
    });

    it('autor deve ter cor cinza', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const autor = screen.getByText('Antoine de Saint-Exupéry');
      expect(autor).toHaveClass('text-gray-600');
    });

    it('categoria deve ter fonte menor e cor cinza clara', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const categoria = screen.getByText('Ficção');
      expect(categoria).toHaveClass('text-sm', 'text-gray-500');
    });
  });

  describe('Edge Cases', () => {
    it('deve renderizar corretamente com título muito longo', () => {
      const livroTituloLongo = {
        ...mockBookDisponivel,
        titulo: 'Um Título Extremamente Longo Que Pode Causar Problemas de Layout Se Não For Tratado Adequadamente'
      };

      renderWithRouter(<BookCard book={livroTituloLongo} />);
      
      const titulo = screen.getByText(livroTituloLongo.titulo);
      expect(titulo).toBeInTheDocument();
      expect(titulo).toHaveClass('truncate'); // Deve truncar títulos longos
    });

    it('deve lidar com categoria vazia ou null', () => {
      const livroSemCategoria = {
        ...mockBookDisponivel,
        categoria: null
      };

      renderWithRouter(<BookCard book={livroSemCategoria} />);
      
      // Não deve causar erro
      expect(screen.getByText('O Principezinho')).toBeInTheDocument();
    });

    it('deve lidar com copias_disponiveis = 1', () => {
      const livroUmaCopia = {
        ...mockBookDisponivel,
        copias_disponiveis: 1
      };

      renderWithRouter(<BookCard book={livroUmaCopia} />);
      
      expect(screen.getByText(/1 disponível/i)).toBeInTheDocument();
    });

    it('deve renderizar corretamente com autor com caracteres especiais', () => {
      const livroAutorEspecial = {
        ...mockBookDisponivel,
        autor: 'José Saramago'
      };

      renderWithRouter(<BookCard book={livroAutorEspecial} />);
      
      expect(screen.getByText('José Saramago')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('link deve ser acessível via teclado', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const link = screen.getByText(/Ver Detalhes/i);
      expect(link).toBeInTheDocument();
      
      // Simular navegação por tab
      link.focus();
      expect(link).toHaveFocus();
    });

    it('deve ter contraste adequado para leitura', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const badge = screen.getByText(/3 disponível/i);
      // Badge verde deve ter text-green-800 (contraste adequado)
      expect(badge).toHaveClass('text-green-800');
    });
  });

  describe('Responsividade', () => {
    it('deve ter padding apropriado', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const card = screen.getByText('O Principezinho').closest('div');
      expect(card).toHaveClass('p-4');
    });

    it('elementos devem estar em flex layout', () => {
      renderWithRouter(<BookCard book={mockBookDisponivel} />);
      
      const container = screen.getByText(/Ver Detalhes/i).closest('div');
      expect(container).toHaveClass('flex', 'justify-between', 'items-center');
    });
  });

  describe('Snapshot Testing', () => {
    it('deve corresponder ao snapshot para livro disponível', () => {
      const { container } = renderWithRouter(<BookCard book={mockBookDisponivel} />);
      expect(container).toMatchSnapshot();
    });

    it('deve corresponder ao snapshot para livro indisponível', () => {
      const { container } = renderWithRouter(<BookCard book={mockBookIndisponivel} />);
      expect(container).toMatchSnapshot();
    });
  });
});