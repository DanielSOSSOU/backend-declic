/**
 * Strips MongoDB operator keys (keys starting with '$') from an object recursively.
 * This prevents NoSQL injection attacks via query operator injection.
 */
const stripOperators = (value) => {
  if (Array.isArray(value)) {
    return value.map(stripOperators);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      if (!key.startsWith('$')) {
        sanitized[key] = stripOperators(val);
      }
    }
    return sanitized;
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = stripOperators(req.body);
  if (req.params) req.params = stripOperators(req.params);
  next();
};

module.exports = { sanitizeInput };
