import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config()

export const generateAccessToken = (user) => {
   
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "1m" },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};
