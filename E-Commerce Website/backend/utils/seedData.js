import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";

dotenv.config();

const products = [
  {
    name: "Aurora Wireless Headphones",
    description: "Over-ear ANC headphones with 40h battery life.",
    price: 8610.94,
    category: "Electronics",
    brand: "Aurora",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    stock: 25,
    rating: 4.6,
    isFeatured: true,
  },

  {
    name: "Pulse Smartwatch",
    description: "Fitness tracking, heart-rate monitor, 7-day battery.",
    price: 12343.71,
    category: "Electronics",
    brand: "Pulse",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    stock: 15,
    rating: 4.3,
    isFeatured: false,
  },

  {
    name: "Terra Canvas Backpack",
    description: "Water-resistant 20L backpack with laptop sleeve.",
    price: 5214.98,
    category: "Bags",
    brand: "Terra",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    stock: 40,
    rating: 4.7,
    isFeatured: true,
  },

  {
    name: "Cascade Running Shoes",
    description: "Lightweight breathable mesh running shoes.",
    price: 7175.62,
    category: "Footwear",
    brand: "Cascade",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    stock: 30,
    rating: 4.4,
    isFeatured: true,
  },

  {
    name: "Nimbus Ceramic Mug Set",
    description: "Set of 4 hand-glazed ceramic mugs, 350ml.",
    price: 2679.26,
    category: "Home",
    brand: "Nimbus",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
    stock: 60,
    rating: 4.8,
    isFeatured: true,
  },

  {
    name: "Solstice Sunglasses",
    description: "Polarized UV400 protection, acetate frame.",
    price: 4305.95,
    category: "Accessories",
    brand: "Solstice",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    stock: 20,
    rating: 4.2,
    isFeatured: true,
  },

  {
    name: "Drift Bluetooth Speaker",
    description: "Portable waterproof speaker, 12h playtime.",
    price: 3826.55,
    category: "Electronics",
    brand: "Drift",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    stock: 35,
    rating: 4.5,
    isFeatured: false,
  },

  {
    name: "Willow Wool Throw Blanket",
    description: "Soft merino-blend throw, 130x180cm.",
    price: 5932.64,
    category: "Home",
    brand: "Willow",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=500",
    stock: 18,
    rating: 4.9,
    isFeatured: false,
  },

  {
    name: "Orbit Mechanical Keyboard",
    description: "Hot-swappable RGB mechanical keyboard.",
    price: 9473.08,
    category: "Electronics",
    brand: "Orbit",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
    stock: 22,
    rating: 4.6,
    isFeatured: false,
  },

  {
    name: "Basin Leather Wallet",
    description: "Full-grain leather bifold wallet with RFID block.",
    price: 3253.38,
    category: "Accessories",
    brand: "Basin",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
    stock: 50,
    rating: 4.4,
    isFeatured: false,
  },

  {
    name: "Fjord Rain Jacket",
    description: "Packable waterproof jacket, taped seams.",
    price: 8420.52,
    category: "Apparel",
    brand: "Fjord",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
    stock: 16,
    rating: 4.3,
    isFeatured: true,
  },

  {
    name: "Ember Cast Iron Skillet",
    description: "Pre-seasoned 10-inch cast iron skillet.",
    price: 3109.85,
    category: "Home",
    brand: "Ember",
    image: "https://images.unsplash.com/photo-1584990347449-a8b2c1c0e7c4?w=500",
    stock: 28,
    rating: 4.8,
    isFeatured: false,
  },
];

const categories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    name: "Bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
  },
  {
    name: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
  },
  {
    name: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
  },
];

const seed = async () => {
  await connectDB();
  await Product.deleteMany();
  await Product.insertMany(products);
  await Category.deleteMany();
  await Category.insertMany(categories);

  const adminExists = await User.findOne({ email: "admin@example.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });
  }

  console.log("Seed complete: products + admin user (admin@example.com / admin123)");
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
