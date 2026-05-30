import express from "express";
import {
  getAllProduct,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecomendedProducts,
  getProductsByCategory,
  toogleFeaturedProduct,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProduct);
router.get("/featured", getFeaturedProducts);
router.get("/recomendations", getRecomendedProducts);
router.get("/category/:category", getProductsByCategory);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toogleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
