const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit comporter au moins 8 caractères'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  validate,
  login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token requis')],
  validate,
  refresh
);

router.post('/logout', authenticate, logout);

module.exports = router;
