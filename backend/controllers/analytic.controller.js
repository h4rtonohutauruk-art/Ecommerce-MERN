import Order from "../models/orders.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const totalProduct = await Product.countDocuments();

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null, //it groups all documents together
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const { totalSales, totalRevenue } = salesData[0] || {
      totalSales: 0,
      totalRevenue: 0,
    };
    return {
      users: totalUser,
      products: totalProduct,
      totalSales,
      totalRevenue,
    };
  } catch (error) {
    console.log("Error in getAnalytics controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getDailySalesData = async (startDate, endDate) => {
  const dailySalesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        sales: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  //   Example data:
  //   [
  //     {
  //       _id: "2024-08-18",
  //       sales: 12,
  //       revenue: 1450.75,
  //     },
  //   ];
  //   [
  //     {
  //       _id: "2024-08-19",
  //       sales: 2,
  //       revenue: 1450.75,
  //     },
  //   ];
  //   [
  //     {
  //       _id: "2024-08-19",
  //       sales: 2,
  //       revenue: 1450.75,
  //     },
  //   ];
  // const dateArray = ["2024-08-24", "2024-08-24", "2024-08-24"]
  const dateArray = getDatesInRange(startDate, endDate);

  return dateArray.map((date) => {
    const foundData = dailySalesData.find((item) => item._id === date);

    return {
      date,
      sales: foundData?.sales || 0,
      revenue: foundData?.revenue || 0,
    };
  });
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
