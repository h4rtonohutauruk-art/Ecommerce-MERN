import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    // console.log("ini cookies dari BE :", req.cookies);
    if (!accessToken) {
      return res.status(401).json({
        message: "Unathorized - No access token provided",
      });
    }
    try {
      const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decode.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "Unathorized - No access token provided",
        });
      }
      req.user = user;
      // console.log("this is middleware : ", req.user);
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Unatgorized - Access token expired",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res.status(401).json({
      message: "Unathorized - Invalid access token",
      Error: error.message,
    });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied - Admin only",
    });
  }
};
