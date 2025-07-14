const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: '请提供 token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'token 无效' });
  }
};
