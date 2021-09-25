const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [{
    ref: 'Role', // el ref sirve para decir que esta relacionado con el modelo de roles
    type: Schema.Types.ObjectId, // tipo de dato objectId
  }],
}, {
  timestamps: true,
  versionKey: false,
});

// creamos un metodo con nombre encryptPassword
// statics es un metodo estatico
userSchema.statics.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};
// creamos un metodo de comparación de contraseñas
userSchema.statics.matchPassword = async (password, receivedPassword) => {
  const result = await bcrypt.compare(password, receivedPassword);
  return result;
};

userSchema.plugin(mongoosePaginate);

module.exports = model('User', userSchema);
