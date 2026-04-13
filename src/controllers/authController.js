const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: String(email) });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({ name: String(name), email: String(email), password: String(password) });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email) }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Ce compte a été désactivé' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token manquant' });
    }

    let decoded;
    try {
      decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token non reconnu' });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    return res.status(200).json({ success: true, message: 'Déconnexion réussie' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };
