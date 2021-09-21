const { isAdmin } = require('../middleware/auth');
const Product = require('../models/Products');
const { isCorrectId } = require('../utils/utils');

const createProduct = async (req, res) => {
  const {
    name, category, price, image,
  } = req.body;
  const newProduct = new Product({
    name, category, price, image,
  });
  const productSaved = await newProduct.save();
  res.status(201).json(productSaved);
};

const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  res.status(200).json(product);
};

const updateProductById = async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, {
    new: true, // para obtener los valores actualizados
  });
  res.status(200).json(updatedProduct);
};

const deleteProductById = async (req, res, next) => {
  try {
    if (!isAdmin(req)) return next(403);

    const { productId } = req.params;

    if (!isCorrectId(productId)) return res.status(404).json({ message: 'wrong id format' });

    const productFound = await Product.findOne({ _id: productId });

    if (!productFound) return res.status(404).json({ message: 'the product does not exist' });

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({ message: 'the product was removed' });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
