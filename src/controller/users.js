// const { config } = require('dotenv');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const { checkIsAdmin } = require('../middleware/auth');
const Role = require('../models/Role');

const User = require('../models/User');
const {
  isValidEmail, isValidPassword, isCorrectIdOrEmail, pages,
} = require('../utils/utils');

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
    return next(error);
  }
};

// obteniendo a todos los usuarios
const getUsers = async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get('host') + req.path}`;
    // console.log(url);
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    const allUsers = await User.paginate({}, { limit, page });
    // console.log(url, allUsers.limit, allUsers.page, allUsers.totalPages);
    const linksPages = pages(allUsers, url, allUsers.limit, allUsers.page, allUsers.totalPages);
    res.json(linksPages);
  } catch (error) {
    return next(error);
  }
};

// obteniendo un usuario por su Id
const getUserById = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { authorization } = req.headers;

    // eslint-disable-next-line no-unused-vars
    const [type, token] = authorization.split(' ');
    const jwToken = jwt.verify(token, secret);

    const validate = isCorrectIdOrEmail(uid);
    const userFound = await User.findOne(validate);
    // console.log(userFound);
    if (!userFound) return next(404);

    const checkAdmin = await checkIsAdmin(req);

    // console.log(jwToken.id === uid);
    if (checkAdmin || jwToken.id === uid) {
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
    const { authorization } = req.headers;

    // eslint-disable-next-line no-unused-vars
    const [type, token] = authorization.split(' ');
    const jwToken = jwt.verify(token, secret);

    const validate = isCorrectIdOrEmail(uid);

    const userFound = await User.findOne(validate);

    if (!userFound) return next(404);

    const checkAdmin = await checkIsAdmin(req);

    // console.log(jwToken.id === uid);

    if (!checkAdmin && jwToken.id !== uid) return res.json({ message: 'Unauthorized' });

    if (Object.entries(body).length === 0) return next(400);

    if (!checkAdmin && body.roles) return res.json({ message: 'require admin role' });

    if (body.email && !isValidEmail(body.email)) return next(400);
    if (body.password && !isValidPassword(body.password)) return next(400);

    const updatedUser = await User.findByIdAndUpdate(uid, body, {
      new: true, // para obtener los valores actualizados
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.json({ message: error });
  }
};

// eliminando usuario
const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { authorization } = req.headers;

    // eslint-disable-next-line no-unused-vars
    const [type, token] = authorization.split(' ');
    const jwToken = jwt.verify(token, secret);
    const checkAdmin = await checkIsAdmin(req);
    // console.log(jwToken.id === uid);

    const validate = isCorrectIdOrEmail(uid);
    const userFound = await User.findOne(validate);
    // console.log(userFound);
    if (!userFound) return next(404);
    // console.log(userFound._id.toString());
    if (checkAdmin || jwToken.id === uid) {
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
