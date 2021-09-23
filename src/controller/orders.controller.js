const Order = require('../models/Order');
const { isCorrectId, pages } = require('../utils/utils');

const createOrder = async (req, res, next) => {
  try {
    const { userId, client, products } = req.body;

    if (!products || products.length === 0) return next(400);

    const productsArray = products.map((elemento) => ({
      qty: elemento.qty,
      product: elemento.productId,
    }));
    const newOrder = new Order({
      userId,
      client,
      products: productsArray,
    });

    const orderSaved = await newOrder.save();
    const currentOrder = await Order.findOne({ _id: orderSaved._id }).populate('products.product');
    return res.status(200).json(currentOrder);
  } catch (error) {
    return next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get('host') + req.path}`;
    // console.log(url);
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    const orders = await Order.paginate({}, { limit, page });
    // console.log(products.totalPages);
    const linksPages = pages(orders, url, orders.limit, orders.page, orders.totalPages);
    // res.json(orders);
    res.json(linksPages);
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!isCorrectId(req.params.orderId)) return next(404);
    const orderFound = await Order.findOne({ _id: req.params.orderId }).populate('products.product');
    if (!orderFound) return next(404);
    return res.status(200).json(orderFound);
  } catch (error) {
    return next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { body } = req;
    const { orderId } = req.params;
    // console.log(orderId);
    if (!isCorrectId(orderId)) return res.status(404).json({ message: 'wrong id format' });
    const orderFound = await Order.findById(orderId);
    // console.log(orderFound);
    if (!orderFound) return res.status(404).json({ message: 'the order does not exist' });
    // console.log(validStatus.includes(body.status));
    if (Object.entries(body).length === 0) return res.status(400).json({ message: 'body empty' });

    const validStatus = ['pending', 'canceled', 'delivering', 'delivered'];
    // console.log(body.status);
    if (body.status && (!validStatus.includes(body.status))) return res.status(404).json({ message: 'status incorrect' });
    const updatedOrder = await Order.findByIdAndUpdate(orderId, body, {
      new: true, // para obtener los valores actualizados
    });
    return res.status(200).json(updatedOrder);
  } catch (error) {
    return next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    // console.log(orderId);
    if (!isCorrectId(orderId)) return res.status(404).json({ message: 'wrong id format' });
    const orderFound = await Order.findById(orderId);
    // console.log(orderFound);
    if (!orderFound) return res.status(404).json({ message: 'the order does not exist' });
    await Order.findByIdAndDelete(orderId);

    return res.status(200).json({ message: 'the order was removed' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
