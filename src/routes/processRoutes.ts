import express from "express";
import { addProcessIds } from "../controllers/processController.js";
import { idsValidation } from "../middlewares/modelValidation.js";
const router = express.Router();

router.post("/process-ids", idsValidation, addProcessIds);

export default router;
