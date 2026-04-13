const { Router } = require('express');
const { body } = require('express-validator');
const { getMe, updateMe, changePassword, deleteMe } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/me', getMe);

router.put(
  '/me',
  [
    body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La bio ne peut pas dépasser 500 caractères'),
    body('avatar').optional().isURL().withMessage("L'avatar doit être une URL valide"),
  ],
  validate,
  updateMe
);

router.put(
  '/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Le nouveau mot de passe doit comporter au moins 8 caractères'),
  ],
  validate,
  changePassword
);

router.delete('/me', deleteMe);

module.exports = router;
