const { checkIsAdmin } = require('../middleware/auth');
const Product = require('../models/Products');
const { isCorrectId, pages } = require('../utils/utils');

const createProduct = async (req, res, next) => {
  try {
    const {
      name, type, price, image,
    } = req.body;

    if (Object.entries(req.body).length === 0) return res.status(400).json({ message: 'body empty' });

    const newProduct = new Product({
      name, type, price, image,
    });
    const productSaved = await newProduct.save();
    res.status(200).json(productSaved);
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get('host') + req.path}`;
    // console.log(url);
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    const products = await Product.paginate({}, { limit, page });
    // console.log(products.totalPages);
    const linksPages = pages(products, url, products.limit, products.page, products.totalPages);
    // res.json(products);
    // res.json(linksPages);
    res.links(linksPages);
    return res.status(200).json(products.docs);
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (!isCorrectId(req.params.productId)) return next(404);
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'product not found' });
    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
};

const updateProductById = async (req, res, next) => {
  try {
    const { body } = req;
    const { productId } = req.params;
    // console.log(productId);
    if (!isCorrectId(productId)) return res.status(404).json({ message: 'wrong id format' });
    if (Object.entries(body).length === 0) return next(400);
    const productFound = await Product.findById(productId);
    // console.log(productFound);

    if (!productFound) return res.status(404).json({ message: 'the product does not exist' });

    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, {
      new: true, // para obtener los valores actualizados
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return next(error);
  }
};

const deleteProductById = async (req, res, next) => {
  try {
    const checkAdmin = await checkIsAdmin(req);

    if (!checkAdmin) return next(403);

    const { productId } = req.params;

    if (!isCorrectId(productId)) return res.status(404).json({ message: 'wrong id format' });

    const productFound = await Product.findOne({ _id: productId });

    if (!productFound) return res.status(404).json({ message: 'the product does not exist' });

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({ message: 'the product was removed' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
