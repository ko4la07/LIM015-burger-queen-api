const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// schema es la descripcion de lo que queremos guardar en la base de datos
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

// el plugin añade un nuevo metodo al modelo
productSchema.plugin(mongoosePaginate);

module.exports = model('Product', productSchema);
