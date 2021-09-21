// const { config } = require('dotenv');
// const jwt = require('jsonwebtoken');
const { isAdmin } = require('../middleware/auth');
const Role = require('../models/Role');

const User = require('../models/User');
const { isValidEmail, isValidPassword, isCorrectIdOrEmail } = require('../utils/utils');

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

// obteniendo un usuario por su Id
const getUserById = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const validate = isCorrectIdOrEmail(uid);
    const userFound = await User.findOne(validate);
    // console.log(userFound);
    if (!userFound) return next(404);
    // console.log(userFound._id.toString());
    if (isAdmin(req) || req.authToken.id === userFound._id.toString()) {
      return res.status(200).json(userFound);
    }
    return next(403);
  } catch (error) {
    return next(error);
  }
};

// actualizando datos de usuario
const updateUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { body } = req;
    // console.log(Object.entries(body));
    const validate = isCorrectIdOrEmail(uid);
    // console.log(validate);
    const userFound = await User.findOne(validate);
    // console.log(userFound);
    if (!userFound) return next(404);
    // console.log(userFound._id.toString());
    if (!isAdmin(req) && req.authToken.uid !== userFound._id.toString()) return next(403);
    if (Object.entries(body).length === 0) return next(400);
    if (!isAdmin(req) && body.roles) return next(403);

    if (body.email && !isValidEmail(body.email)) return next(400);
    if (body.password && !isValidPassword(body.password)) return next(400);

    const updatedUser = await User.findByIdAndUpdate(uid, body, {
      new: true, // para obtener los valores actualizados
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    next(404);
  }
};

// eliminando usuario
const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const validate = isCorrectIdOrEmail(uid);
    const userFound = await User.findOne(validate);
    // console.log(userFound);
    if (!userFound) return next(404);
    // console.log(userFound._id.toString());
    if (isAdmin(req) || req.authToken.uid === userFound._id.toString()) {
      await User.findByIdAndDelete({ _id: userFound._id });
      return res.status(200).send(userFound);
    }
    return next(403);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers, createUser, getUserById, updateUser, deleteUser,
};
