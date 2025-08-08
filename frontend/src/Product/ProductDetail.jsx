import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "../lib/motion";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import NavBar from "../navbar/NavBar";
import Footer from "../Footer/Footer";
import api from "../lib/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const reviewFormRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");

  // States for review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAnonymous, setReviewAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // State for product images
  const [mainImage, setMainImage] = useState("");
  const [imageGallery, setImageGallery] = useState([]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  // Extract query parameters
  const { search } = window.location;
  const params = new URLSearchParams(search);
  const showReview = params.get('review') === 'true';
  const reviewOrderId = params.get('orderId');
  
  // Helper function to get user display name based on review data
  const getReviewDisplayName = (review) => {
    if (review.anonymous === true) return "Anonymous";
    if (review.user && review.user.name) return review.user.name;
    return "User";
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Use axios with API_BASE_URL
        const response = await api.get(`/api/products/${id}`);

        // The API returns the product directly, not wrapped in a 'product' field
        const productData = response.data;
        
        // Make sure reviews are properly formatted for display
        if (productData.reviews && productData.reviews.length > 0) {
          productData.reviews = productData.reviews.map(review => ({
            ...review,
            user: review.user || { name: "User" }
          }));
        }
        
        setProduct(productData);
        
        // If review parameter is present, switch to review tab
        if (showReview) {
          setActiveTab("reviews");
        }

        // Set main image and gallery
        if (productData.imageUrl) {
          setMainImage(productData.imageUrl);
          setImageGallery([
            productData.imageUrl,
            // Add placeholder images to gallery if no additional images
            ...Array(4).fill("./src/assets/capsule1.png.png"),
          ]);
        }

        // Fetch related products with API_BASE_URL
        const relatedResponse = await api.get(
          `/api/products?category=${productData.category._id}&limit=5&excludeProduct=${id}`
        );

        if (relatedResponse.data.products) {
          setRelatedProducts(relatedResponse.data.products);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
        setLoading(false);
        toast.error(
          err.response?.data?.message || "Error loading product details"
        );
      }
    };

    fetchProduct();

    // Reset review form and scroll to top when product ID changes
    setReviewRating(5);
    setReviewComment("");
    setReviewAnonymous(false);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Add the specified quantity at once
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    navigate("/checkout");
  };

  const handleQuantityChange = (value) => {
    const newQty = Math.max(
      1,
      Math.min(product?.stock || 10, quantity + value)
    );
    setQuantity(newQty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    try {
      setIsSubmittingReview(true);

      // Include orderId in the review submission if available
      const reviewData = {
        rating: reviewRating,
        text: reviewComment,  // The backend expects 'text' not 'comment'
        anonymous: reviewAnonymous  // Include anonymous flag
      };
      
      // Add orderId if it exists from URL parameters
      if (reviewOrderId) {
        reviewData.orderId = reviewOrderId;
      }

      // Use the dedicated reviews API endpoint
      const response = await api.post(`/api/reviews/products/${id}`, reviewData);

      // Get the user data from localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const username = user.name || "Anonymous";
      
      // Create a new review object with the server data or fallback to our own
      const serverReview = response.data.review || {};
      const newReview = {
        _id: response.data.reviewId || serverReview._id || Date.now().toString(),
        rating: serverReview.rating || reviewRating,
        text: serverReview.text || reviewComment, // Match the backend field name
        user: reviewAnonymous 
          ? { name: "Anonymous" } 
          : (serverReview.user || { name: username }),
        anonymous: reviewAnonymous,
        createdAt: serverReview.createdAt || new Date().toISOString(),
        verifiedPurchase: response.data.verifiedPurchase || false
      };
      
      // Update product reviews array in real-time
      setProduct(prevProduct => ({
        ...prevProduct,
        reviews: [newReview, ...(prevProduct.reviews || [])]
      }));
      
      // Display success toast with review details
      toast.success(
        <div>
          <strong>{newReview.verifiedPurchase ? "Verified purchase review submitted!" : "Review submitted!"}</strong>
          <div>Thank you for your feedback, {reviewAnonymous ? "Anonymous User" : username}.</div>
        </div>, 
        { autoClose: 4000 }
      );
      
      setReviewComment("");
      setReviewRating(5);
      setReviewAnonymous(false);
      
      // Remove review parameters from URL after submission
      if (showReview) {
        window.history.replaceState({}, document.title, `/products/${id}`);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      
      // Detailed error handling with specific messages
      if (err.response) {
        // Server responded with an error
        const status = err.response.status;
        const serverMessage = err.response.data?.message || "Unknown server error";
        
        if (status === 400) {
          toast.error(`Error: ${serverMessage}`);
        } else if (status === 401) {
          toast.error("Authentication error. Please log in again.");
          // You might want to redirect to login page here
        } else if (status === 500) {
          console.error("Server error details:", err.response.data);
          toast.error(`Server error: ${serverMessage}`);
        } else {
          toast.error(`Error (${status}): ${serverMessage}`);
        }
      } else if (err.request) {
        // Request was made but no response was received
        toast.error("Server did not respond. Please check your internet connection.");
      } else {
        // Something else caused the error
        toast.error(`Error: ${err.message || "Unknown error occurred"}`);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const scrollToReviews = () => {
    setActiveTab("reviews");
    if (reviewFormRef.current) {
      setTimeout(() => {
        reviewFormRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
      </div>
    );
  };

  // Interactive star rating component
  const StarRating = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;

          return (
            <label key={index} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
                className="hidden"
              />
              <svg
                className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                  (hover || rating) >= ratingValue
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa]/30 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <NavBar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#036372] dark:border-[#1fa9be]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Link
              to="/products"
              className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
            >
              Back to Products
            </Link>
          </div>
        ) : product ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumbs */}
            <nav className="flex mb-6 text-sm overflow-x-auto whitespace-nowrap pb-2">
              <Link 
                to="/" 
                className="text-gray-500 dark:text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be] flex-shrink-0"
              >
                Home
              </Link>
              <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
              <Link 
                to="/products" 
                className="text-gray-500 dark:text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be] flex-shrink-0"
              >
                Products
              </Link>
              {product.category && (
                <>
                  <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
                  <Link 
                    to={product.category._id ? `/products?category=${product.category._id}` : '/products'} 
                    className="text-gray-500 dark:text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be] flex-shrink-0"
                  >
                    {product.category.name || 'Category'}
                  </Link>
                </>
              )}
              <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
              <span className="text-gray-800 dark:text-gray-200 truncate" title={product.name}>
                {product.name}
              </span>
            </nav>

            {/* Product Details - Enhanced UI */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Product Image Gallery */}
                  <div className="lg:w-2/5">
                    {/* Main Image */}
                    <div className="bg-[#e0f7fa]/20 dark:bg-gray-700/20 rounded-lg p-4 flex items-center justify-center mb-4">
                      <motion.img
                        src={
                          mainImage ||
                          product.imageUrl ||
                          "./src/assets/lohasav.jpg"
                        }
                        alt={product.name}
                        className="max-h-[400px] w-full object-contain"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {imageGallery.slice(0, 5).map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setMainImage(img)}
                          className={`flex-shrink-0 border-2 rounded-md overflow-hidden h-16 w-16 
                            ${
                              mainImage === img
                                ? "border-[#036372] dark:border-[#1fa9be]"
                                : "border-transparent"
                            }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Badges and Labels */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {product.stock > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                          Out of Stock
                        </span>
                      )}

                      {product.requiresPrescription && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          Prescription Required
                        </span>
                      )}

                      {product.featured && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="lg:w-3/5">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {renderStars(product.rating || 4)}
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({product.rating || 4}.0) •{" "}
                        {product.reviews?.length || 0} Reviews
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-[#036372] dark:text-[#1fa9be] mr-2">
                          ₹{product.price}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <>
                            <span className="text-lg line-through text-gray-500 dark:text-gray-400 mr-2">
                              ₹{product.mrp}
                            </span>
                            <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-md">
                              {Math.round(
                                ((product.mrp - product.price) / product.mrp) *
                                  100
                              )}
                              % OFF
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>

                    {/* Short Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {product.description.substring(0, 150)}...
                    </p>

                    {/* Stock Status */}
                    <div className="mb-6">
                      {product.stock > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          In Stock ({product.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    {product.stock > 0 && (
                      <div className="flex items-center mb-6">
                        <span className="mr-4 text-gray-700 dark:text-gray-300">
                          Quantity:
                        </span>
                        <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            className="px-3 py-1 border-r border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 flex items-center justify-center text-gray-800 dark:text-gray-200">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            className="px-3 py-1 border-l border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={`px-6 py-3 rounded-lg font-semibold text-white ${
                          product.stock <= 0
                            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372]"
                        } transition-colors`}
                        whileHover={{ scale: product.stock <= 0 ? 1 : 1.03 }}
                        whileTap={{ scale: product.stock <= 0 ? 1 : 0.97 }}
                      >
                        {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                      </motion.button>

                      <motion.button
                        className="px-6 py-3 rounded-lg font-semibold text-[#036372] dark:text-[#1fa9be] border-2 border-[#036372] dark:border-[#1fa9be] hover:bg-[#e0f7fa]/50 dark:hover:bg-gray-700/50 transition-colors"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Add to Wishlist
                      </motion.button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Category
                          </p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {product.category.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            SKU
                          </p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {product.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Product Details Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                      activeTab === "description"
                        ? "border-b-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be]"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab("specifications")}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                      activeTab === "specifications"
                        ? "border-b-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be]"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                      activeTab === "reviews"
                        ? "border-b-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be]"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Reviews
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "description" && (
                  <div className="prose max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-p:text-gray-600 dark:prose-p:text-gray-300">
                    <p>{product.description}</p>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { name: "Brand", value: product.brand || "Generic" },
                        { name: "Category", value: product.category.name },
                        {
                          name: "Prescription Required",
                          value: product.requiresPrescription ? "Yes" : "No",
                        },
                        {
                          name: "Dosage Form",
                          value: product.dosageForm || "N/A",
                        },
                        {
                          name: "Package Size",
                          value: product.packageSize || "N/A",
                        },
                        {
                          name: "Storage",
                          value:
                            product.storage || "Store in a cool, dry place",
                        },
                      ].map((item, index) => (
                        <li key={index} className="py-3 flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    {product.reviews && product.reviews.length > 0 ? (
                      <div>
                        {/* Review Summary */}
                        <div className="mb-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="text-3xl font-bold text-[#036372] dark:text-[#1fa9be]">
                              {product.rating.toFixed(1)}
                            </div>
                            <div className="ml-2">
                              <div className="flex">{renderStars(product.rating)}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Based on {product.reviews.length} reviews
                              </div>
                            </div>
                          </div>
                        </div>
                      
                        {/* Review List */}
                        <div className="space-y-4">
                          {product.reviews.map((review) => (
                            <div
                              key={review._id}
                              className="border-b border-gray-200 dark:border-gray-700 pb-4"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <div className="font-medium text-gray-800 dark:text-gray-200 mr-2">
                                    {getReviewDisplayName(review)}
                                  </div>
                                  {renderStars(review.rating)}
                                  
                                  {/* Verified Badge */}
                                  {(review.verifiedPurchase || review.orderId) && (
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300">
                                {review.text || review.comment || "No comment provided"}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add Review Button */}
                        <div className="mt-6 text-center">
                          <button 
                            onClick={scrollToReviews}
                            className="inline-flex items-center px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            Write a Review
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No reviews yet.
                        </p>
                        <button 
                          onClick={scrollToReviews}
                          className="mt-4 inline-flex items-center px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          Be the First to Review
                        </button>
                      </div>
                    )}
                    
                    {/* Review Form */}
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6" ref={reviewFormRef}>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Write a Review</h3>
                      <form onSubmit={handleReviewSubmit}>
                        <div className="mb-4">
                          <label className="block text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                          <div className="flex">
                            <StarRating rating={reviewRating} setRating={setReviewRating} />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 mb-2">Review</label>
                          <textarea
                            id="comment"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            rows="4"
                            placeholder="Share your experience with this product..."
                            required
                          ></textarea>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center">
                            <input 
                              id="anonymous" 
                              type="checkbox"
                              checked={reviewAnonymous}
                              onChange={(e) => setReviewAnonymous(e.target.checked)}
                              className="w-4 h-4 text-[#036372] bg-gray-100 border-gray-300 rounded focus:ring-[#1fa9be] dark:focus:ring-[#036372] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="anonymous" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Post as anonymous
                            </label>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className={`px-4 py-2 rounded-lg font-semibold text-white 
                            ${isSubmittingReview 
                              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                              : 'bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372]'
                            } transition-colors`}
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  Related Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {relatedProducts.map((relProduct) => (
                    <motion.div
                      key={relProduct._id}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                    >
                      <Link
                        to={`/products/${relProduct._id}`}
                        className="block"
                      >
                        <div className="h-40 bg-[#e0f7fa]/20 dark:bg-gray-700/20 flex items-center justify-center p-4">
                          <img
                            src={
                              relProduct.imageUrl || "./src/assets/lohasav.jpg"
                            }
                            alt={relProduct.name}
                            className="max-h-full object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                            {relProduct.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-bold text-[#036372] dark:text-[#1fa9be]">
                              ₹{relProduct.price}
                            </span>
                            {relProduct.mrp &&
                              relProduct.mrp > relProduct.price && (
                                <span className="text-xs line-through text-gray-500 dark:text-gray-400">
                                  ₹{relProduct.mrp}
                                </span>
                              )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-24">
            <p className="text-gray-600 dark:text-gray-400">
              Product not found
            </p>
            <Link
              to="/products"
              className="mt-4 inline-block px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-md transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
