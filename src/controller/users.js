// const { config } = require('dotenv');
// const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
// const User = require('../models/User');

const User = require('../models/User');
const { isValidEmail, isValidPassword } = require('../utils/utils');

// Creando usuarios
const createUser = async (req, res, next) => {
  try {
    const {
      username, email, password, roles,
    } = req.body;

    // verificamos que los campos no esten vacíos
    if (!email || !password) {
      return next(400);
    }

    // check if email y pass entry are correct
    if (!isValidEmail(email) || !isValidPassword(password)) return next(400);
    // return res.json('valido');
    const searchUser = await User.findOne({ email });
    // console.log(searchUser);
    if (searchUser) {
      return res.status(403).json({ message: 'The email is already registered' });
    }
    const newUser = new User({
      username,
      email,
      password: await User.encryptPassword(password),
      roles,
    });

    if (roles) {
      const foundRoles = await Role.find({ name: { $in: roles } }); // $in todas las coincidencias
      newUser.roles = foundRoles.map((role) => role._id);
    } else {
      const role = await Role.findOne({ name: 'user' });
      newUser.roles = [role._id];
    }

    await newUser.save();

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

// obteniendo a todos los usuarios
// !!! falta modificar y mostrar los resultados que nos piden en la documentación
const getUsers = async (req, res) => {
  const allUsers = await User.find();
  res.json(allUsers);
};

module.exports = { getUsers, createUser };
