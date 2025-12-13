const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('deve registar um novo utilizador com dados válidos', async () => {
      const newUser = {
        nome: 'João Silva',
        email: `teste${Date.now()}@exemplo.com`, // Email único
        password: 'senha123',
        tipo: 'aluno'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('id');
    });

    it('não deve registar utilizador com email duplicado', async () => {
      const user = {
        nome: 'Maria Santos',
        email: 'duplicado@exemplo.com',
        password: 'senha123',
        tipo: 'aluno'
      };

      // Primeiro registo
      await request(app)
        .post('/api/auth/register')
        .send(user);

      // Tentar registar novamente com o mesmo email
      const res = await request(app)
        .post('/api/auth/register')
        .send(user);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Email já registado');
    });

    it('não deve registar utilizador sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Pedro Costa'
          // Faltam email, password, tipo
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeAll(async () => {
      // Criar utilizador de teste
      testUser = {
        nome: 'Teste Login',
        email: `login${Date.now()}@exemplo.com`,
        password: 'senha123',
        tipo: 'aluno'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('deve fazer login com credenciais válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('nome');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('tipo');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('não deve fazer login com password incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'senhaerrada'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Credenciais inválidas');
    });

    it('não deve fazer login com email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naexiste@exemplo.com',
          password: 'senha123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('token JWT deve ser válido e conter informações do utilizador', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const token = res.body.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verificar se o token tem 3 partes (header.payload.signature)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
      // Criar e autenticar utilizador
      testUser = {
        nome: 'Teste Me',
        email: `me${Date.now()}@exemplo.com`,
        password: 'senha123',
        tipo: 'professor'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginRes.body.token;
    });

    it('deve retornar dados do utilizador autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('tipo');
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.tipo).toBe(testUser.tipo);
    });

    it('não deve retornar dados sem token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('não deve retornar dados com token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer tokeninvalido123');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});