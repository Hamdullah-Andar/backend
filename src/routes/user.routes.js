import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
// we have to import router from express 

// as we were creating app from express , here we have to create route from Router
const router = Router();

router.route('/register').post(registerUser)

export default router