import User from "../Model/user.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../util/token.js";

const login = async (req, res) => {

  try {
    const { email, password } = req.body;

 

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    let x = await User.findOne({ email: email });

    if (!x) {
      return res.status(400).json({ error: "User not found" });
    }

    let isMatch = await bcrypt.compare(password, x.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const accessToken = generateAccessToken(x);
    const refreshToken = generateRefreshToken(x);

   return res
     .status(200)
     .cookie("refreshToken", refreshToken, {
       httpOnly: true,
       secure: false, // true in production (HTTPS)
       sameSite: "strict",
     })
     .json({
       message: "Login successful",
       accessToken,
     });
  } catch (error) {
    console.log("here is the error ")
    res.status(500).json({ error: error.message });
  }
};

export default login;
