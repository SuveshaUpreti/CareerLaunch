import React, { useEffect, useState } from "react";

interface Favorite {
  _id: string;
  title: string;
  coverLetter: string;
  createdAt: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch favorite cover letters on component load
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view favorites.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5001/api/favorites", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("No favorite cover letters saved yet.");
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Debug log

        // Check if data is an array or an object with favorites array
        const favoritesData = Array.isArray(data) ? data : data.favorites;

        setFavorites(favoritesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Handle deleting a favorite
  const handleDeleteFavorite = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5001/api/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete favorite.");
      }

      // Update UI after deletion
      setFavorites((prev) => prev.filter((fav) => fav._id !== id));
    } catch (error) {
      console.error("❌ Failed to delete favorite:", error);
    }
  };

  // Sort favorites so the most recent ones are displayed first
  const sortedFavorites = [...favorites].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">
          Your Favorite Cover Letters
        </h1>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : sortedFavorites.length === 0 ? (
          <p className="text-gray-600">No favorite cover letters saved yet.</p>
        ) : (
          <div className="space-y-6">
            {sortedFavorites.map((fav) => (
              <div
                key={fav._id}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                {/* Display the title */}
                <h3 className="text-lg font-bold">{fav.title}</h3>
                {/* Display the cover letter */}
                <p className="whitespace-pre-wrap mt-2">{fav.coverLetter}</p>
                <p className="text-gray-500 text-sm mt-2">
                  📅 Saved on: {new Date(fav.createdAt).toLocaleString()}
                </p>
                {/* Delete Button */}
                <button
                  className="mt-2 text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteFavorite(fav._id)}
                >
                  ❌ Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
