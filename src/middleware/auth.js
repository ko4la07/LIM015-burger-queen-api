const jwt = require('jsonwebtoken');

const User = require('../models/User');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  // console.log(authorization);

  if (!authorization) {
    return next(403);
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }
  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }
    // Verificar identidad del usuario usando `decodeToken.uid`
    const searchUser = User.findById(decodedToken.id);

    searchUser
      .then((doc) => {
        if (!doc) {
          return next(404);
        }

        req.authToken = decodedToken;
        return next();
      })
      .catch(() => next(403));
  });
};

// module.exports.isAuthenticated = (req) => req.authToken || false;
module.exports.isAuthenticated = (req) => {
  if (req.authToken) return true;
  return false;
};

// module.exports.isAdmin = (req) => adminIs(req);
module.exports.isAdmin = async (req) => {
  const doc = await User.findOne({ _id: req.authToken.id }).populate('roles');
  const element = doc.roles;
  const res = element.map((id) => id.name);
  const result = res.includes('admin');
  return result;
};

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => {
  module.exports.isAdmin(req)
    .then((res) => {
      if (!module.exports.isAuthenticated(req)) {
        return next(401);
      }
      if (!res) {
        return next(403);
      }
      next();
    });
};
