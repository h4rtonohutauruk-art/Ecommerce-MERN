import { create } from "zustand";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  isCouponApplied: false,

  //   setCart({ cart: [] });
  setCart: () => set({ cart: [] }),
  //   setProducst: (products) => set({ products }),

  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");
      set({ coupon: res.data.coupon });
      // console.log("this is res :", res);
    } catch (error) {
      console.log("Error fetching coupon:", error);
    }
  },

  validateMyCoupon: async (code) => {
    try {
      // console.log("this is code ", code);
      const res = await axios.get(`/coupons/validate/${code}`);
      // console.log("this is validate from BE", res);
      set({
        coupon: res.data,
        isCouponApplied: true,
      });
      get().calculateTotals();
      toast.success("Coupon applied successfully!");
    } catch (error) {
      console.log("Error while validating code:", error);
      toast.error(error?.response?.data?.message || "Failed to apply coupon");
      // set({
      //   coupon:null
      // })
    }
  },

  removeCoupon: () => {
    set({
      coupon: null,
      isCouponApplied: false,
    });
    get().calculateTotals();
    toast.success("Removed Coupon!!");
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({
        cart: res.data,
      });
      get().calculateTotals();
      // console.log("this is cart", get().cart);
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || "An error occured");
    }
  },

  clearCart: async () => {
    set({ cart: [], total: 0, subTotal: 0, coupon: null });
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Product added to cart");
      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id,
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item,
            )
          : [...prevState.cart, { ...product, quantity: 1 }];

        return { cart: newCart };
      });
      // console.log("this is product added :", get());
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Please Login first");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    let total = subTotal;

    if (coupon) {
      const discount = (subTotal * coupon.discountPercentage) / 100;
      total = subTotal - discount;
    }
    // console.log(`subtotal : ${subTotal} and total ${total} `);
    set({
      subTotal,
      total,
    });
  },

  updateQuantity: async (productId, quantity) => {
    try {
      if (quantity === 0) {
        get().removeAllFromCart(productId);
        return;
      }
      const res = await axios.put(`/cart/${productId}`, { quantity });
      // console.log("this is res : ", res);
      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item._id === productId
            ? {
                ...item,
                quantity,
              }
            : item,
        ),
      }));
      get().calculateTotals();
    } catch (error) {
      console.log("Error in updateQuantity controller : ", error.message);
      toast.error(error.response?.data?.message || "An error occured");
    }
  },

  removeAllFromCart: async (productId) => {
    try {
      // await axios.delete("/cart", { data: productId });
      const res = await axios.delete("/cart", {
        data: { productId },
      });
      // console.log("this is res ", res);

      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      // console.log("state setalah di delete", get().cart);
      get().calculateTotals();
    } catch (error) {
      console.log("Error in removeAllFromCart controller", error.message);
      toast.error(error.response?.data?.message || "An error occured");
    }
  },
}));
