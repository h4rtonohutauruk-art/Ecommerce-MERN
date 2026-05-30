import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
export const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find({}); //find all the product
    res.json({ products });
  } catch (error) {
    res.status(500).json({
      message: "Error in getAllProduct controller",
      Error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    // if is not in redis, fetch from mongodb
    // .lean() is gonna return a plain javascript object instead of a mongodb document
    // which is good for performance
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({
        message: "No featured products found",
      });
    }

    // store in redis for future quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {}
};
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; //this will get the id of the image

      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("deleted image from cloudinary");
      } catch (error) {
        console.log("error deleting image from cloudinary", error);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    console.log("run this command:", res.json);
    // res.json;
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
    console.log("wait if errors from backend");
  } catch (error) {
    console.log("Error in deleteProducts controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getRecomendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in getRecommended controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
    // console.log(
    //   `this is product :  ${products} based on category : ${category} `,
    // );
  } catch (error) {
    console.log("Error in getProductByCategory controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const toogleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updateProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updateProduct);
      // console.log("this is if executed", updateProduct);
    } else {
      res.status(400).json({
        message: "Product not found",
      });
    }
  } catch (error) {
    console.log("Error in toogleFeatured controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

async function updateFeaturedProductsCache(params) {
  try {
    // The Lean() method is used to return plain javascript object
    // istead of full Moongose documents. This can significantly improve performance
    const featuredProduct = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProduct));
    // console.log("this is featured setting in redis", featuredProduct);
  } catch (error) {
    console.log("error in update cache function");
  }
}
