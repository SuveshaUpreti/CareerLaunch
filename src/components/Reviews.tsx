import React, { useState, useEffect } from "react";

interface Review {
  _id: string;
  email: string;
  rating: number;
  text: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [inquiryText, setInquiryText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Fetch all reviews on load
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    fetch("http://localhost:5001/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("❌ Failed to fetch reviews:", err));
  };

  const handleSubmitReview = () => {
    if (rating === 0 || reviewText.trim() === "") {
      alert("⚠️ Please select a rating and enter review text.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit a review.");
      return;
    }

    fetch("http://localhost:5001/api/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, text: reviewText }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("✅ Review submitted successfully!");
        setReviewText("");
        setRating(0);
        fetchReviews(); // Refresh reviews
        setShowReviewForm(false); // Close form after submission
      })
      .catch((err) => {
        console.error("❌ Failed to submit review:", err);
        alert(err.message || "Failed to submit review.");
      });
  };

  const handleSubmitInquiry = () => {
    if (!inquiryText.trim()) {
      alert("Please enter a message before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to send an inquiry.");
      return;
    }

    fetch("http://localhost:5001/api/report", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: inquiryText }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("📩 Inquiry sent successfully!");
        setInquiryText("");
        setShowInquiryForm(false); // Close form after submission
      })
      .catch((err) => {
        console.error("❌ Failed to send inquiry:", err);
        alert(err.message || "Failed to send inquiry.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-6">
          Reviews & Inquiries
        </h1>

        {/* Buttons to Show Forms */}
        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {showReviewForm ? "Close Review Form" : "Leave a Review"}
          </button>

          <button
            onClick={() => setShowInquiryForm(!showInquiryForm)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            {showInquiryForm ? "Close Inquiry Form" : "Report an Issue"}
          </button>
        </div>

        {/* Review Form - Only Shows if Button is Clicked */}
        {showReviewForm && (
          <div className="bg-gray-100 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave a Review</h2>

            <div className="flex items-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`w-6 h-6 text-yellow-400 ${
                    rating >= star ? "opacity-100" : "opacity-30"
                  }`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write your review..."
              className="w-full p-2 border rounded"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <button
              onClick={handleSubmitReview}
              className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Submit Review
            </button>
          </div>
        )}

        {/* Inquiry Form - Only Shows if Button is Clicked */}
        {showInquiryForm && (
          <div className="bg-gray-100 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Report an Issue</h2>

            <textarea
              placeholder="Describe your issue or inquiry..."
              className="w-full p-2 border rounded"
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
            />

            <button
              onClick={handleSubmitInquiry}
              className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Send Inquiry
            </button>

            <p className="text-gray-600 text-sm mt-2">
              Have a question or feedback? Use this form to:
            </p>
            <ul className="text-gray-500 text-sm mt-1 list-disc pl-4">
              <li>Report a bug or issue</li>
              <li>Request a new feature</li>
              <li>Ask a question about the platform</li>
            </ul>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-gray-50 rounded-lg shadow-lg p-6 max-h-80 overflow-y-auto">
          <h2 className="text-2xl font-semibold text-indigo-600 text-center mb-4">
            User Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center">No reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="border p-4 rounded-lg shadow-sm bg-white">
                  <p className="text-yellow-400 text-lg">{`⭐`.repeat(review.rating)}</p>
                  <p className="mt-2 text-gray-700">{review.text}</p>
                  <p className="text-sm text-gray-500 mt-1">- {review.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
