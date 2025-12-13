const request = require('supertest');
const app = require('../server');

describe('Books Endpoints', () => {
  let bibliotecarioToken;
  let alunoToken;

  beforeAll(async () => {
    // Criar bibliotecário
    const bibliotecario = {
      nome: 'Bibliotecário Books',
      email: `biblio_books${Date.now()}@exemplo.com`,
      password: 'senha123',
      tipo: 'bibliotecario'
    };

    await request(app)
      .post('/api/auth/register')
      .send(bibliotecario);

    const biblioLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: bibliotecario.email,
        password: bibliotecario.password
      });

    bibliotecarioToken = biblioLogin.body.token;

    // Criar aluno
    const aluno = {
      nome: 'Aluno Books',
      email: `aluno_books${Date.now()}@exemplo.com`,
      password: 'senha123',
      tipo: 'aluno'
    };

    await request(app)
      .post('/api/auth/register')
      .send(aluno);

    const alunoLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: aluno.email,
        password: aluno.password
      });

    alunoToken = alunoLogin.body.token;
  });

  describe('GET /api/livros', () => {
    it('deve listar todos os livros sem autenticação (endpoint público)', async () => {
      const res = await request(app)
        .get('/api/livros');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve retornar livros com estrutura correta', async () => {
      const res = await request(app)
        .get('/api/livros');

      if (res.body.length > 0) {
        const livro = res.body[0];
        expect(livro).toHaveProperty('id_livro');
        expect(livro).toHaveProperty('titulo');
        expect(livro).toHaveProperty('autor');
        expect(livro).toHaveProperty('isbn');
        expect(livro).toHaveProperty('categoria');
        expect(livro).toHaveProperty('total_copias');
        expect(livro).toHaveProperty('copias_disponiveis');
      }
    });

    it('deve filtrar livros por categoria', async () => {
      const res = await request(app)
        .get('/api/livros?categoria=Ficção');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar se todos os livros são da categoria solicitada
      res.body.forEach(livro => {
        if (livro.categoria) {
          expect(livro.categoria).toBe('Ficção');
        }
      });
    });

    it('deve filtrar livros por disponibilidade', async () => {
      const res = await request(app)
        .get('/api/livros?disponivel=true');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar se todos têm copias_disponiveis > 0
      res.body.forEach(livro => {
        expect(livro.copias_disponiveis).toBeGreaterThan(0);
      });
    });

    it('deve pesquisar livros por termo de busca', async () => {
      const res = await request(app)
        .get('/api/livros?pesquisa=test');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar se o termo aparece no título ou autor
      res.body.forEach(livro => {
        const termInTitulo = livro.titulo.toLowerCase().includes('test');
        const termInAutor = livro.autor.toLowerCase().includes('test');
        expect(termInTitulo || termInAutor).toBe(true);
      });
    });
  });

  describe('GET /api/livros/:id', () => {
    let testBookId;

    beforeAll(async () => {
      // Criar livro para testes
      const book = {
        titulo: 'Livro Detalhes Teste',
        autor: 'Autor Detalhes',
        isbn: `DETAILS${Date.now()}`,
        categoria: 'Teste',
        descricao: 'Descrição do livro de teste',
        data_publicacao: '2023-06-15',
        total_copias: 3
      };

      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(book);

      testBookId = res.body.id;
    });

    it('deve retornar detalhes de um livro específico', async () => {
      const res = await request(app)
        .get(`/api/livros/${testBookId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id_livro', testBookId);
      expect(res.body).toHaveProperty('titulo');
      expect(res.body).toHaveProperty('autor');
      expect(res.body).toHaveProperty('descricao');
      expect(res.body).toHaveProperty('data_publicacao');
    });

    it('deve retornar 404 para livro inexistente', async () => {
      const res = await request(app)
        .get('/api/livros/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/livros', () => {
    it('bibliotecário deve conseguir criar livro', async () => {
      const newBook = {
        titulo: 'Novo Livro Teste',
        autor: 'Novo Autor',
        isbn: `NEW${Date.now()}`,
        categoria: 'Romance',
        descricao: 'Um livro de teste muito interessante',
        data_publicacao: '2024-01-01',
        total_copias: 5
      };

      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(newBook);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('id');

      // Verificar se foi criado
      const getRes = await request(app)
        .get(`/api/livros/${res.body.id}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.titulo).toBe(newBook.titulo);
      expect(getRes.body.autor).toBe(newBook.autor);
      expect(getRes.body.copias_disponiveis).toBe(newBook.total_copias);
    });

    it('aluno não deve conseguir criar livro', async () => {
      const newBook = {
        titulo: 'Livro Aluno',
        autor: 'Autor',
        isbn: `ALUNO${Date.now()}`,
        categoria: 'Teste',
        total_copias: 2
      };

      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send(newBook);

      expect(res.statusCode).toBe(403);
    });

    it('não deve criar livro sem autenticação', async () => {
      const newBook = {
        titulo: 'Livro Sem Auth',
        autor: 'Autor',
        isbn: `NOAUTH${Date.now()}`,
        categoria: 'Teste',
        total_copias: 2
      };

      const res = await request(app)
        .post('/api/livros')
        .send(newBook);

      expect(res.statusCode).toBe(401);
    });

    it('não deve criar livro com ISBN duplicado', async () => {
      const isbn = `DUPLICATE${Date.now()}`;
      
      const book1 = {
        titulo: 'Primeiro Livro',
        autor: 'Autor 1',
        isbn: isbn,
        categoria: 'Teste',
        total_copias: 2
      };

      // Primeiro livro
      await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(book1);

      // Tentar criar segundo livro com mesmo ISBN
      const book2 = {
        titulo: 'Segundo Livro',
        autor: 'Autor 2',
        isbn: isbn,
        categoria: 'Teste',
        total_copias: 3
      };

      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(book2);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('ISBN já existe');
    });

    it('não deve criar livro sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          titulo: 'Livro Incompleto'
          // Faltam autor, isbn, total_copias
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/livros/:id', () => {
    let testBookId;

    beforeEach(async () => {
      // Criar livro para atualizar
      const book = {
        titulo: 'Livro Para Atualizar',
        autor: 'Autor Original',
        isbn: `UPDATE${Date.now()}`,
        categoria: 'Original',
        total_copias: 5
      };

      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(book);

      testBookId = res.body.id;
    });

    it('bibliotecário deve conseguir atualizar livro', async () => {
      const updates = {
        titulo: 'Título Atualizado',
        autor: 'Autor Atualizado',
        isbn: `UPDATED${Date.now()}`,
        categoria: 'Atualizada',
        descricao: 'Descrição atualizada',
        data_publicacao: '2024-12-01',
        total_copias: 10
      };

      const res = await request(app)
        .put(`/api/livros/${testBookId}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verificar atualizações
      const getRes = await request(app)
        .get(`/api/livros/${testBookId}`);

      expect(getRes.body.titulo).toBe(updates.titulo);
      expect(getRes.body.autor).toBe(updates.autor);
      expect(getRes.body.categoria).toBe(updates.categoria);
    });

    it('aluno não deve conseguir atualizar livro', async () => {
      const res = await request(app)
        .put(`/api/livros/${testBookId}`)
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({ titulo: 'Novo Título' });

      expect(res.statusCode).toBe(403);
    });

    it('deve retornar 404 ao atualizar livro inexistente', async () => {
      const res = await request(app)
        .put('/api/livros/99999')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({ titulo: 'Título' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/livros/:id', () => {
    let testBookId;

    beforeEach(async () => {
      // Criar livro para deletar
      const book = {
        titulo: 'Livro Para Deletar',
        autor: 'Autor Delete',
        isbn: `DELETE${Date.now()}`,
        categoria: 'Delete',
        total_copias: 2
      };

      const res = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(book);

      testBookId = res.body.id;
    });

    it('bibliotecário deve conseguir deletar livro', async () => {
      const res = await request(app)
        .delete(`/api/livros/${testBookId}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verificar se foi deletado
      const getRes = await request(app)
        .get(`/api/livros/${testBookId}`);

      expect(getRes.statusCode).toBe(404);
    });

    it('aluno não deve conseguir deletar livro', async () => {
      const res = await request(app)
        .delete(`/api/livros/${testBookId}`)
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('não deve deletar livro com empréstimos ativos', async () => {
      // Criar empréstimo ativo
      const aluno = {
        nome: 'Aluno Delete Test',
        email: `delete_test${Date.now()}@exemplo.com`,
        password: 'senha123',
        tipo: 'aluno'
      };

      const alunoRes = await request(app)
        .post('/api/auth/register')
        .send(aluno);

      await request(app)
        .post('/api/emprestimos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          id_utilizador: alunoRes.body.id,
          id_livro: testBookId
        });

      // Tentar deletar
      const res = await request(app)
        .delete(`/api/livros/${testBookId}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('empréstimos ativos');
    });

    it('deve retornar 404 ao deletar livro inexistente', async () => {
      const res = await request(app)
        .delete('/api/livros/99999')
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});