const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// autenticando usuarios
const authUser = async (req, res, next) => {
  // res.json('autenticando');
  const { email, password } = req.body;
  // console.log(req.body);

  // verificamos que los campos no esten vacíos
  if (!email || !password) {
    return next(400);
    // res.json('pass or email empty');
  }

  // buscamos coincidencias del email ingresado
  const userSearch = User.findOne({ email }).populate('roles');
  userSearch
    .then((doc) => {
      if (doc === null) res.status(400).json({ message: 'User does not exist' });
      // console.log(doc);

      // Corroboramos que la contraseña ingresada es correcta
      const matchPass = User.matchPassword(password, doc.password);
      // console.log(matchPass);
      matchPass
        .then((pass) => {
          if (!pass) return res.status(400).json({ token: null, message: 'Invalid Password' });

          const token = jwt.sign({ id: doc._id }, config.secret, {
            expiresIn: 86400, // 24 horas
          });
          res.status(200).json({ token });
        });
    });
};

module.exports = {
  authUser,
};
