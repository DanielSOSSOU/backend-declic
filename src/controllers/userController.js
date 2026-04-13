const User = require('../models/User');

// GET /api/users/me
const getMe = async (req, res) => {
  return res.status(200).json({ success: true, data: { user: req.user } });
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = String(req.body[field]);
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, message: 'Profil mis à jour', data: { user } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me
const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return res.status(200).json({ success: true, message: 'Compte désactivé avec succès' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, changePassword, deleteMe };
