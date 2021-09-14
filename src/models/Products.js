const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: String,
  category: String,
  price: Number,
  image: String,
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = model('Product', productSchema);
