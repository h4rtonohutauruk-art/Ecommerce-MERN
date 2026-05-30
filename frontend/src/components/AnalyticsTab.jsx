import axios from "../lib/axios";
import { motion } from "framer-motion";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [dailySalesData, setDailySalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(response.data.dailySalesData);
        setIsLoading(false);
      } catch (error) {
        console.log("Error fetching analytics data:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);
  if (isLoading) {
    return <div>Loading....</div>;
  }
  return (
    <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color=" from-emerald-500 to-teal-700"
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color=" from-emerald-500 to-teal-700"
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color=" from-emerald-500 to-teal-700"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={analyticsData.totalRevenue.toLocaleString()}
          icon={DollarSign}
          color=" from-emerald-500 to-teal-700"
        />
      </div>
      <motion.div
        className=" bg-gray-800/60 rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke=" #d1d5db" />
            <YAxis yAxisId="left" stroke="d1d5db" />
            <YAxis yAxisId="right" orientation="right" stroke="#d1d5db" />
            <Tooltip />
            <Legend />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#3882f6"
              activeDot={{ r: 8 }}
              name="Revenue"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              activeDot={{ r: 8 }}
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className=" flex justify-between items-center">
      <div className=" z-10">
        <p className=" text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className=" text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className=" absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30"></div>
    <div className=" absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className=" h-32 w-32"></Icon>
    </div>
  </motion.div>
);
