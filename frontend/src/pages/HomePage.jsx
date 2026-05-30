import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { motion } from "framer-motion";

const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "T-Shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
  { href: "/glasess", name: "Glasess", imageUrl: "/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jeans.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
  { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
  const { fetchFeaturedProduct, loading, products } = useProductStore();
  useEffect(() => {
    fetchFeaturedProduct();
  }, [fetchFeaturedProduct]);
  return (
    <div className=" relative min-h-screen text-white overflow-hidden">
      <div className=" relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* <h1
          className=" text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.4 }}
        >
          Explore our Categories
        </h1> */}
        {/* <motion.p
          className=" text-center text-xl text-gray-300 mb-12"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Discover the latest trends in eco-friendly fashion
        </motion.p> */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className=" text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
            Explore our Categories
          </h1>
          <p className=" text-center text-xl text-gray-300 mb-12">
            Discover the latest trends in eco-friendly fashion
          </p>
        </motion.div>
        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>
        {!loading && products.length > 0 && (
          <FeaturedProducts featureProducts={products} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
