import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    // if not in cache, fetch from database
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({
        message: "No featured products found",
      });
    }

    // store in cache (redis) for quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category } = req.body;

    if (!name || !price || !description || !category || !image) {
      return res.status(400).json({
        error:
          "Please provide all required fields: name, price, description, category, and image",
      });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        error: "Price must be a positive number",
      });
    }

    let cloudinaryResponse = null;
    try {
      if (
        !process.env.CLOUDINARY_API_SECRET ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_CLOUD_NAME
      ) {
        throw new Error("Cloudinary configuration is missing");
      }

      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
        throw new Error("Failed to get image URL from Cloudinary");
      }
    } catch (uploadError) {
      console.error("Error uploading image to Cloudinary:", uploadError);
      return res.status(500).json({
        error: "Server error: Failed to upload image. Please try again later.",
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      image: cloudinaryResponse.secure_url,
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      error: "Failed to create product. Please try again.",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // get the public id from the url
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log("Error in deeting image in cloudinary", error.message);
      }
    }
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: {
          size: 3,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function updateFeaturedProductsCache() {
  try {
    // lean() - returns a plain JavaScript object
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in update cache function", error.message);
  }
}
