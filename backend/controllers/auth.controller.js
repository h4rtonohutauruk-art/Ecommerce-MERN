import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    // sameSite: "strict", //prevent CSRF attack cross site request forgery attack
    sameSite: "strict", //hndlepayment by stripe
    maxAge: 15 * 60 * 1000, //15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevent CSRF attack cross site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, //15 minutes
  });
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  const userExist = await User.findOne({ email });

  try {
    if (userExist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({ name, email, password });

    // authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log("Error in logout controller:", error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      console.log("Invlid coming from backend");
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error while verify the user in bcrypt",
      error: Error.message,
    });
    console.log("Error in login controller:", error);
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decode.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({
      message: "Logged out successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
    console.log("Error in logout controller:", error);
  }
};

// this will refresh access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "No Refresh token provided",
      });
    }
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedRefreshToken = await redis.get(
      `refresh_token:${decode.userId}`,
    );
    if (storedRefreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
    const { accessToken } = generateTokens(decode.userId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true, //prevent XSS attacks, cross site scripting attack
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", //prevent CSRF attack cross site request forgery attack
      maxAge: 15 * 60 * 1000, //15 minutes
    });

    res.json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in refreshToken controller",
      error: error.message,
    });
  }
};

// TODO: implement get profile user
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
    // console.log("get profile :", res.json(req.user));
  } catch (error) {
    console.error("Error in getProfile : ", error.message);
    res.status(500).json({ message: "Server error: ", error: error.message });
  }
};
