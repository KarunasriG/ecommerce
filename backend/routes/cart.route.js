import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addItemToCart,
  getCartProducts,
  removeAllItemsFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addItemToCart);
router.delete("/", protectRoute, removeAllItemsFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;
