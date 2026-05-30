import { HandHeart, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";
import { useState } from "react";
import { useEffect } from "react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useRef } from "react";
const PurchaseSuccessPage = () => {
  // const [IsProcessing, setIsProcessing] = useState(true);
  // const [error, setError] = useState(null);
  // const { clearCart } = useCartStore();

  // useEffect(() => {
  //   const handleCheckoutSuccess = async (sessionId) => {
  //     try {
  //       await axios.post("/payments/createCheckoutSuccess", { sessionId });
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   };
  //   const sessionId = new URLSearchParams(window.location.search).get(
  //     "session_id",
  //   );
  //   if (sessionId) {
  //     handleCheckoutSuccess(sessionId);
  //   } else {
  //     setIsProcessing(false);
  //     setError("No session ID found in the url");
  //   }
  // }, [clearCart]);

  // if (IsProcessing) return "Processing";

  // if (error) return `Error:${error}`;

  const [, setIsProcessing] = useState(true);
  const [isOrderId, setOrderId] = useState("");
  const [, setError] = useState(null);
  const { getCartItems } = useCartStore();

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    hasProcessed.current = true;

    let isMounted = true;

    const handleCheckoutSuccess = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id",
        );

        if (!sessionId) {
          if (isMounted) {
            setError("No session ID found");

            setIsProcessing(false);
          }

          return;
        }

        const res = await axios.post("/payments/checkout-success", {
          sessionId,
        });
        // console.log("this is res", res);
        setOrderId(res.data.orderId);
        await getCartItems();
      } catch (error) {
        console.log(error);

        if (isMounted) {
          setError("Failed to verify payment");
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    handleCheckoutSuccess();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className=" h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className=" max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className=" p-6 sm:p-6">
          <div className=" flex justify-center">
            <CheckCircle className=" text-emerald-400 w-16 h-16 mb-4" />
          </div>
          <h1 className=" text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
            purchase Successful!
          </h1>
          <p className=" text-gray-300 text-center mb-2">
            Thank you for your order. {"We're"} processing it now.
          </p>
          <p className=" text-emerald-400 text-center text-sm mb-6">
            Check your email for order details and updates.
          </p>
          <div className=" bg-gray-700 rounded-lg p-4 mb-6">
            <div className=" flex items-center justify-between mb-2">
              <span className=" text-sm text-gray-400">Order number</span>
              <span className=" text-sm font-semibold text-emerald-400">
                {isOrderId}
              </span>
            </div>
          </div>
          <div className=" flex items-center justify-between">
            <span className=" text-sm text-gray-400">Estimated delivery</span>
            <span className=" text-sm font-semibold text-emerald-400">
              3-5 business days
            </span>
          </div>
        </div>
        <div className=" space-y-4">
          <button className=" w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center">
            <HandHeart className=" mr-2" size={18} />
            Thanks for trusting us!
          </button>
        </div>
        <div className=" space-y-2">
          <Link to={"/"} className="">
            <button className=" w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center">
              Continue Shopping
              <ArrowRight className=" ml-2" size={18} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
