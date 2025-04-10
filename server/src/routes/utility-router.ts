import express from "express";
import { UtilityController } from "../controllers/utility-controller";

const router = express.Router();

// Get current term and year
router.get("/current-term", UtilityController.getCurrentTermAndYear);

export default router;