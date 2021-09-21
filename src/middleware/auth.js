const jwt = require('jsonwebtoken');

const User = require('../models/User');
const config = require('../config');

const { secret } = config;
module.exports.isAuthenticated = async (req, resp, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(403);
    }

    const [type, token] = authorization.split(' ');

    if (type.toLowerCase() !== 'bearer') {
      return resp.status(401).json({ message: 'Bad type of token' });
    }
    // console.log(token);
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        return next(403);
      }
      req.userId = decodedToken.id;
    });
    const searchUser = await User.findById(req.userId);
    // console.log(searchUser);
    if (!searchUser) return resp.status(404).json({ message: 'no user found' });
    next();
  } catch (error) {
    return resp.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports.isAdmin = async (req, resp, next) => {
  try {
    const doc = await User.findOne({ _id: req.userId }).populate('roles');
    const element = doc.roles;
    const res = element.map((id) => id.name);
    const result = res.includes('admin');
    if (!result) return resp.status(403).json({ message: 'Require Admin role' });
    next();
  } catch (error) {
    console.error(error);
  }
};
