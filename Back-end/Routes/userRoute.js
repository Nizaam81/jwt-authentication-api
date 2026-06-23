import express from "express";
import login from "../controller/userControler.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { refreshToken } from "../controller/refreshController.js";

const router = express.Router();

router.post("/verify", login);

router.get("/home", verifyAccessToken, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed",
    user: req.user,
  });
});


router.post("/refresh", refreshToken);

export default router;  
