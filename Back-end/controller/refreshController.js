import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const refreshToken = (req, res) => {

  

  const refreshToken = req.cookies.refreshToken;

  console.log("Refresh Token:", refreshToken);

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token missing",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    console.log("Decoded:", decoded);

    const accessToken = jwt.sign(
      {
        id: decoded.id,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "1m",
      },
      );
      console.log("New Access Token:", accessToken);

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.log("Refresh Error:", error.message);

    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
};
