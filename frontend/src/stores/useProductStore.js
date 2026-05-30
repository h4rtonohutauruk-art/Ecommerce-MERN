import { create } from "zustand";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";

export const useProductStore = create((set, get) => ({
  loading: false,
  products: [],

  setProducst: (products) => set({ products }),
  createProduct: async (productData) => {
    try {
      set({ loading: true });
      await axios.post("/products", productData);
      toast.success("Created New Product");
    } catch (error) {
      toast.error(error?.response?.data?.error);
      console.log("Error in createProduct:", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchAllProduct: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({
        products: res.data.products,
        loading: false,
      });
      // console.log("this is all the product", res.data.products);
    } catch (error) {
      console.log("Error in fetchAllProduct", error.message);
      toast.error(error.response?.data?.error || "An error occured");
      // toast.error(error.response.data.error || "An error occured");
    }
  },
  deleteProduct: async (productId) => {
    set({
      loading: true,
    });
    try {
      await axios.delete(`/products/${productId}`);
      // console.log("this is delete based on id : ", productId);
      set((prevProducts) => ({
        products: prevProducts.products.filter(
          (product) => product._id !== productId,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      console.log("Error in deleteProduct:", error.message);
      toast.error(error.response?.data?.error || "An error occured");
    }
  },
  toggleFeatured: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/products/${productId}`);
      // console.log("Thisi is update toggle based  on this id", productId);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? {
                ...product,
                isFeatured: res.data.isFeatured,
              }
            : product,
        ),
      }));
    } catch (error) {
      console.log("Error in toggleFeatured based on id :", error.message);
      toast.error(error.response?.data?.error || "An error occured");
    }
  },
  getProductsByCategory: async (category) => {
    set({
      loading: true,
    });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({
        products: res.data.products,
        loading: false,
      });
    } catch (error) {
      console.log("Error in getProductByCategory controller: ", error.message);
      toast.error(error.response?.data?.error || "An error occured");
    }
  },
  fetchFeaturedProduct: async () => {
    set({
      loading: true,
    });
    try {
      const res = await axios.get("/products/featured");

      set({
        products: res.data,
        loading: false,
      });
      // console.log("this is res", get());
    } catch (error) {
      console.log("Error in fetchFeaturedProduct controller: ", error.message);
      toast.error(error.response?.data?.error || "An error occured");
      set({
        error: error.message,
        loading: false,
      });
    }
  },
}));
