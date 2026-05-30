import { ArrowLeft, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
  return (
    <div className=" h-screen flex items-center justify-center px-4">
      <div className=" max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className=" p-6 sm:p-6">
          <div className=" flex justify-center">
            <XCircle className=" text-red-500 w-16 h-16 mb-4" />
          </div>
          <h1 className=" text-2xl sm:text-3xl font-bold text-center text-red-500 mb-2">
            Purchase Cancelled
          </h1>
          <p className=" text-gray-300 text-center mb-2">
            Your order has been canceled. No charge have been trade
          </p>

          <div className=" bg-gray-700 rounded-lg p-6 mb-6">
            <div className=" flex items-center justify-between ">
              <p className=" text-white text-center text-sm  ">
                if you encountered any issue during the checkout process, please
                don't hesitate to contact our support team
              </p>
            </div>
          </div>
        </div>
        <div className=" space-y-4">
          <Link to={"/"}>
            <button className=" w-full bg-gray-700  text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center">
              <ArrowLeft className=" mr-2" size={18} />
              Return to Shop
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCancelPage;
