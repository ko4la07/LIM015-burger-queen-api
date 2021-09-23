const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema, model } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  products: [{
    qty: {
      type: Number,
    },
    product: {
      type: Schema.Types.ObjectId, // tipo de dato objectId
      ref: 'Product', // el ref sirve para decir que esta relacionado con el modelo de Productos
      required: true,
    },
  }],
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  dateEntry: {
    type: Date,
    default: Date.now,
  },
  dateProcessed: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// el plugin añade un nuevo metodo al modelo
orderSchema.plugin(mongoosePaginate);

module.exports = model('Order', orderSchema);
