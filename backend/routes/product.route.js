import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, isAdmin, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);

router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, isAdmin, createProduct);
router.patch("/:id", protectRoute, isAdmin, toggleFeaturedProduct);
router.delete("/:id", protectRoute, isAdmin, deleteProduct);

export default router;
