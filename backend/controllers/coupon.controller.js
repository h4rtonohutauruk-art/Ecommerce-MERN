import Coupon from "../models/coupon.model.js";
export const getCoupon = async (req, res) => {
  const userId = req.user;
  try {
    const coupon = await Coupon.findOne({ userId, isActive: true });
    res.status(200).json({
      coupon: coupon,
      message: "get coupon from BE",
    });
  } catch (error) {
    console.log("Error in getCoupon controller:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    console.log("This code coming from FE:", code);
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      return res.status(404).json({
        message: "Coupon expired!",
      });
    }
    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller: ", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
