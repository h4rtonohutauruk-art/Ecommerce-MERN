import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = () => {
  // const recomendations = [];

  const [recomendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get("/products/recomendations");
        // console.log("this is recommend product:", res);
        setRecommendations(res.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occured while fetching recommendations",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  return (
    <div className=" mt-8">
      <h3 className=" text-2xl font-semibold text-emerald-400">
        People Also Bought
      </h3>
      <div className=" mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recomendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
