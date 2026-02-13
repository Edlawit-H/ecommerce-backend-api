const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  const { customerName, customerEmail } = req.body;
  const cartItems = await Cart.find().populate("product");

  if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

  let total = 0;
  for (let item of cartItems) {
    if (item.product.stock < item.quantity)
      return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });

    total += item.product.price * item.quantity;
    item.product.stock -= item.quantity;
    await item.product.save();
  }

  const order = await Order.create({
    items: cartItems.map(i => ({ product: i.product._id, quantity: i.quantity })),
    total,
    customerName,
    customerEmail,
  });

  await Cart.deleteMany();
  res.status(201).json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("items.product");
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};
