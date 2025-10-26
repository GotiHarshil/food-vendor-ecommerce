import express from "express";
import { getAllFoods } from "../controllers/foodController.js";

const router = express.Router();

router.get("/", getAllFoods);

export default router;
