const Product = require('../models/Products');

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

const deleteProductById = async (req, res) => {
  const { productId } = req.params;
  await Product.findByIdAndDelete(productId);
  res.status(204).json();
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
