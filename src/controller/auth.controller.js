const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const Role = require('../models/Role');

// Creando usuarios
const signUp = async (req, res) => {
  // res.json('signUp');
  const {
    username, email, password, roles,
  } = req.body;

  // console.log(req.body);

  const newUser = new User({
    username,
    email,
    password: await User.encryptPassword(password),
  });

  // console.log(newUser);

  if (roles) {
    const foundRoles = await Role.find({ name: { $in: roles } }); // $in todas las coincidencias
    newUser.roles = foundRoles.map((role) => role._id);
  } else {
    const role = await Role.findOne({ name: 'user' });
    newUser.roles = [role._id];
  }

  const savedUser = await newUser.save();
  // console.log(savedUser);

  // console.log(config.secret);
  // console.log(savedUser._id);

  // el metodo sign de jwt crea un token
  const token = jwt.sign({ id: savedUser._id }, config.secret, {
    expiresIn: 86400, // 24 horas
  });

  return res.status(200).json({ token });
};

// sign in usuarios
const signIn = async (req, res) => {
  // populate para obtener todo el contenido de los roles
  const userFound = await User.findOne({ email: req.body.email }).populate('roles');

  if (!userFound) return res.status(400).json({ message: 'User not found' });

  const matchPass = await User.matchPassword(req.body.password, userFound.password);

  if (!matchPass) return res.status(400).json({ token: null, message: 'Invalid Password' });

  const token = jwt.sign({ id: userFound._id }, config.secret, {
    expiresIn: 86400, // 24 horas
  });

  res.json({ token });
};

// autenticando usuarios
const authUser = async (req, res) => {
  // res.json('autenticando');
  const { email, password } = req.body;
  // console.log(req.body);

  // verificamos que los campos no esten vacios
  if (!email || !password) {
    res.json('pass or email empty');
  }

  // buscamos coincidencias del email ingresado
  const userSearch = User.findOne({ email });
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
          res.json({ token });
        })
        .catch((error) => res.status(404).json({ error }));
    });
};

module.exports = {
  signIn,
  signUp,
  authUser,
};
