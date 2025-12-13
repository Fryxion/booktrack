const request = require('supertest');
const app = require('../server');

describe('Loans Endpoints', () => {
  let bibliotecarioToken;
  let alunoToken;
  let testBook;
  let testUser;

  beforeAll(async () => {
    // Criar bibliotecário
    const bibliotecario = {
      nome: 'Bibliotecário Teste',
      email: `biblio${Date.now()}@exemplo.com`,
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
      nome: 'Aluno Teste',
      email: `aluno${Date.now()}@exemplo.com`,
      password: 'senha123',
      tipo: 'aluno'
    };

    const alunoReg = await request(app)
      .post('/api/auth/register')
      .send(aluno);

    testUser = { id: alunoReg.body.id, ...aluno };

    const alunoLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: aluno.email,
        password: aluno.password
      });

    alunoToken = alunoLogin.body.token;

    // Criar livro de teste
    const book = {
      titulo: 'Livro de Teste Empréstimo',
      autor: 'Autor Teste',
      isbn: `ISBN${Date.now()}`,
      categoria: 'Teste',
      descricao: 'Livro para testes de empréstimo',
      data_publicacao: '2023-01-01',
      total_copias: 5
    };

    const bookRes = await request(app)
      .post('/api/livros')
      .set('Authorization', `Bearer ${bibliotecarioToken}`)
      .send(book);

    testBook = bookRes.body;
  });

  describe('POST /api/emprestimos', () => {
    it('bibliotecário deve conseguir criar empréstimo', async () => {
      // Obter disponibilidade inicial
      const bookBefore = await request(app)
        .get(`/api/livros/${testBook.id}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      const copiasDisponiveisAntes = bookBefore.body.copias_disponiveis;

      // Criar empréstimo
      const res = await request(app)
        .post('/api/emprestimos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          id_utilizador: testUser.id,
          id_livro: testBook.id
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('data_devolucao_prevista');

      // Verificar se copias_disponiveis foi decrementada
      const bookAfter = await request(app)
        .get(`/api/livros/${testBook.id}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(bookAfter.body.copias_disponiveis).toBe(copiasDisponiveisAntes - 1);
    });

    it('data de devolução prevista deve ser +14 dias', async () => {
      const res = await request(app)
        .post('/api/emprestimos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          id_utilizador: testUser.id,
          id_livro: testBook.id
        });

      expect(res.statusCode).toBe(201);

      const dataDevolucao = new Date(res.body.data_devolucao_prevista);
      const hoje = new Date();
      const diff = Math.ceil((dataDevolucao - hoje) / (1000 * 60 * 60 * 24));

      expect(diff).toBeGreaterThanOrEqual(13); // Margem para diferenças de horário
      expect(diff).toBeLessThanOrEqual(15);
    });

    it('não deve criar empréstimo sem autenticação', async () => {
      const res = await request(app)
        .post('/api/emprestimos')
        .send({
          id_utilizador: testUser.id,
          id_livro: testBook.id
        });

      expect(res.statusCode).toBe(401);
    });

    it('aluno não deve conseguir criar empréstimo (apenas bibliotecários)', async () => {
      const res = await request(app)
        .post('/api/emprestimos')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({
          id_utilizador: testUser.id,
          id_livro: testBook.id
        });

      expect(res.statusCode).toBe(403);
    });

    it('não deve criar empréstimo de livro sem cópias disponíveis', async () => {
      // Criar livro sem cópias
      const bookSemCopias = {
        titulo: 'Livro Sem Cópias',
        autor: 'Autor',
        isbn: `NOCOPIES${Date.now()}`,
        categoria: 'Teste',
        total_copias: 0
      };

      const bookRes = await request(app)
        .post('/api/livros')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send(bookSemCopias);

      const res = await request(app)
        .post('/api/emprestimos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          id_utilizador: testUser.id,
          id_livro: bookRes.body.id
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('indisponível');
    });
  });

  describe('GET /api/emprestimos', () => {
    it('bibliotecário deve conseguir listar todos os empréstimos', async () => {
      const res = await request(app)
        .get('/api/emprestimos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('aluno não deve conseguir listar todos os empréstimos', async () => {
      const res = await request(app)
        .get('/api/emprestimos')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/emprestimos/meus', () => {
    it('utilizador deve conseguir listar seus próprios empréstimos', async () => {
      const res = await request(app)
        .get('/api/emprestimos/meus')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar estrutura dos empréstimos
      if (res.body.length > 0) {
        const emprestimo = res.body[0];
        expect(emprestimo).toHaveProperty('id_emprestimo');
        expect(emprestimo).toHaveProperty('id_livro');
        expect(emprestimo).toHaveProperty('titulo');
        expect(emprestimo).toHaveProperty('autor');
        expect(emprestimo).toHaveProperty('data_emprestimo');
        expect(emprestimo).toHaveProperty('data_devolucao_prevista');
      }
    });

    it('não deve listar empréstimos sem autenticação', async () => {
      const res = await request(app)
        .get('/api/emprestimos/meus');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/emprestimos/:id/devolver', () => {
    let emprestimoId;

    beforeEach(async () => {
      // Criar empréstimo para devolver
      const res = await request(app)
        .post('/api/emprestimos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          id_utilizador: testUser.id,
          id_livro: testBook.id
        });

      emprestimoId = res.body.id;
    });

    it('bibliotecário deve conseguir registar devolução', async () => {
      // Obter copias_disponiveis antes
      const bookBefore = await request(app)
        .get(`/api/livros/${testBook.id}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      const copiasAntes = bookBefore.body.copias_disponiveis;

      // Registar devolução
      const res = await request(app)
        .put(`/api/emprestimos/${emprestimoId}/devolver`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verificar se copias_disponiveis foi incrementada
      const bookAfter = await request(app)
        .get(`/api/livros/${testBook.id}`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(bookAfter.body.copias_disponiveis).toBe(copiasAntes + 1);
    });

    it('não deve registar devolução de empréstimo já devolvido', async () => {
      // Primeira devolução
      await request(app)
        .put(`/api/emprestimos/${emprestimoId}/devolver`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      // Segunda tentativa
      const res = await request(app)
        .put(`/api/emprestimos/${emprestimoId}/devolver`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('já foi devolvido');
    });

    it('aluno não deve conseguir registar devolução', async () => {
      const res = await request(app)
        .put(`/api/emprestimos/${emprestimoId}/devolver`)
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});