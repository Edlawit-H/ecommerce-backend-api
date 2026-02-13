const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  const cart = await Cart.find().populate("product");
  res.json(cart);
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock < quantity) return res.status(400).json({ message: "Not enough stock" });

  const existing = await Cart.findOne({ product: productId });
  if (existing) {
    existing.quantity += quantity;
    await existing.save();
    return res.json(existing);
  }

  const item = await Cart.create({ product: productId, quantity });
  res.status(201).json(item);
};

exports.updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const item = await Cart.findOne({ product: productId });
  if (!item) return res.status(404).json({ message: "Item not in cart" });
  item.quantity = quantity;
  await item.save();
  res.json(item);
};

exports.removeFromCart = async (req, res) => {
  await Cart.findOneAndDelete({ product: req.params.productId });
  res.json({ message: "Item removed" });
};
