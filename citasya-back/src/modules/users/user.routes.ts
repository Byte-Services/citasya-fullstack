import { Router } from "express";
import { loginUser, updateUser, createUser } from "./user.controller.js";

const router = Router();

router.post("/login", loginUser);
router.put("/:id", updateUser);
router.post("/", createUser);


export default router;
