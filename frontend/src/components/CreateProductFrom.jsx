import { motion } from "framer-motion";
import { useState } from "react";
import { Upload, Loader, PlusCircle } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const categories = [
  "jeans",
  "t-Shirts",
  "shoes",
  "glasess",
  "jackets",
  "suits",
  "bags",
];

const CreateProductFrom = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [Nameofimage, setNameofimage] = useState();
  const { loading, createProduct } = useProductStore();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("this file", file?.name);
    setNameofimage(file?.name);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewProduct((prev) => ({
          ...prev,
          image: reader.result,
        }));
        console.log("this is name of the image", reader);
      };
      reader.readAsDataURL(file); //base64
    }
  };

  const clearFormData = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("this is product:", newProduct);
    try {
      await createProduct(newProduct);
      clearFormData();
    } catch (error) {
      console.log("Error while creating product", error.message);
    }
  };
  return (
    <motion.div
      className="p-8 mb-8 max-w-xl bg-gray-800 mx-auto shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <h2 className=" mb-8 text-2xl text-left font-extrabold  text-emerald-400">
        Create new product
      </h2>
      <form onSubmit={handleSubmit} className=" space-y-6">
        <div>
          <label
            htmlFor="name"
            className=" block text-sm font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProduct.name}
            onChange={(e) => {
              setNewProduct((prev) => ({ ...prev, name: e.target.value }));
            }}
            className=" mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          ></input>
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white
               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="price"
            className=" block text-sm font-medium text-gray-300"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={newProduct.price}
            onChange={(e) => {
              setNewProduct((prev) => ({ ...prev, price: e.target.value }));
            }}
            step="0.01"
            className=" mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          ></input>
        </div>
        <div>
          <label
            htmlFor="category"
            className=" block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            className=" mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className=" my-3 flex items-center">
          <input
            type="file"
            id="image"
            className=" sr-only"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label
            htmlFor="image"
            className=" cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500"
          >
            <Upload className=" h-5 w-5 inline-block mr-2" />
            Upload Image
          </label>
          {newProduct.image && (
            <span className=" ml-3 text-sm text-gray-400">{Nameofimage}</span>
          )}
        </div>
        <div></div>
        <div>
          <button
            type="submit"
            className=" w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm
           font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader
                  className=" mr-2 h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
                Loading...
              </>
            ) : (
              <>
                <PlusCircle className=" mr-2 h-5 w-5" />
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateProductFrom;
