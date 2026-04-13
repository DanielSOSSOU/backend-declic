process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const request = require('supertest');
const createApp = require('../src/app');

// Mock mongoose to avoid needing a real database connection
jest.mock('../src/models/User');

const User = require('../src/models/User');

const app = createApp();

afterEach(() => {
  jest.clearAllMocks();
});

const makeUser = (overrides = {}) => ({
  _id: 'user-id-123',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  isActive: true,
  bio: '',
  avatar: null,
  refreshToken: null,
  comparePassword: jest.fn(),
  save: jest.fn().mockResolvedValue(true),
  toJSON: jest.fn().mockReturnValue({
    _id: 'user-id-123',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    bio: '',
    avatar: null,
  }),
  ...overrides,
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const user = makeUser();
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(user);

      const res = await request(app).post('/api/auth/register').send({
        name: 'Jean Dupont',
        email: 'jean@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'jean@example.com' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 when email is already taken', async () => {
      User.findOne.mockResolvedValue(makeUser());

      const res = await request(app).post('/api/auth/register').send({
        name: 'Jean Dupont',
        email: 'jean@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jean', email: 'jean@example.com', password: '123' });

      expect(res.status).toBe(422);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jean', email: 'not-an-email', password: 'Password123' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = makeUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jean@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const user = makeUser({ comparePassword: jest.fn().mockResolvedValue(false) });
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jean@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 for an invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' });

      expect(res.status).toBe(401);
    });

    it('should return 422 when refreshToken field is missing', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 without a token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });
});

