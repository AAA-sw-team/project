const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token = req.headers['authorization'];
  console.log('[Auth Middleware] token received:', token);

  if (!token) {
    return res.status(403).json({ error: '请提供 token' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[Auth Middleware] token 验证失败:', err.message);
    res.status(401).json({ error: 'token 无效' });
  }
};

