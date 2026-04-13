process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const request = require('supertest');
const jwt = require('jsonwebtoken');
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
  name: 'Marie Curie',
  email: 'marie@example.com',
  isActive: true,
  bio: '',
  avatar: null,
  refreshToken: null,
  comparePassword: jest.fn(),
  save: jest.fn().mockResolvedValue(true),
  toJSON: jest.fn().mockReturnValue({
    _id: 'user-id-123',
    name: 'Marie Curie',
    email: 'marie@example.com',
    bio: '',
    avatar: null,
  }),
  ...overrides,
});

const validToken = () =>
  jwt.sign({ id: 'user-id-123' }, process.env.JWT_SECRET, { expiresIn: '15m' });

describe('User Routes', () => {
  describe('GET /api/users/me', () => {
    it('should return the authenticated user profile', async () => {
      const user = makeUser();
      User.findById.mockResolvedValue(user);

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${validToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update user name and bio', async () => {
      const user = makeUser();
      const updatedUser = makeUser({
        name: 'Marie Sklodowska-Curie',
        bio: 'Physicist and chemist',
        toJSON: jest.fn().mockReturnValue({
          _id: 'user-id-123',
          name: 'Marie Sklodowska-Curie',
          email: 'marie@example.com',
          bio: 'Physicist and chemist',
          avatar: null,
        }),
      });
      User.findById.mockResolvedValue(user);
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ name: 'Marie Sklodowska-Curie', bio: 'Physicist and chemist' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Marie Sklodowska-Curie');
    });

    it('should return 422 for invalid avatar URL', async () => {
      const user = makeUser();
      User.findById.mockResolvedValue(user);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ avatar: 'not-a-url' });

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/users/me/password', () => {
    it('should change the password with valid current password', async () => {
      const user = makeUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      User.findById.mockResolvedValue(user);
      // For the password route, findById is called with select('+password')
      const userWithPassword = makeUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      User.findById.mockReturnValueOnce(user); // authenticate middleware
      User.findById.mockReturnValueOnce({ select: jest.fn().mockResolvedValue(userWithPassword) }); // controller

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ currentPassword: 'SecurePass1', newPassword: 'NewPassword99' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for wrong current password', async () => {
      const user = makeUser();
      const userWithPassword = makeUser({ comparePassword: jest.fn().mockResolvedValue(false) });
      User.findById.mockReturnValueOnce(user);
      User.findById.mockReturnValueOnce({ select: jest.fn().mockResolvedValue(userWithPassword) });

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ currentPassword: 'WrongPass', newPassword: 'NewPassword99' });

      expect(res.status).toBe(401);
    });

    it('should return 422 for too short new password', async () => {
      const user = makeUser();
      User.findById.mockResolvedValue(user);

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ currentPassword: 'SecurePass1', newPassword: '123' });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/users/me', () => {
    it('should deactivate the user account', async () => {
      const user = makeUser();
      User.findById.mockResolvedValue(user);
      User.findByIdAndUpdate.mockResolvedValue({ ...user, isActive: false });

      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${validToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

