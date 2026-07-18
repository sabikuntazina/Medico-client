"use client";

import { useEffect, useState } from "react";
import { FiStar, FiMessageSquare, FiPlus, FiTrash2, FiEdit2, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

export default function PatientReviews() {
  const [reviews, setReviews] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New review form state
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      // Fetch user reviews
      const reviewsRes = await fetch(`${apiUrl}/api/reviews/patient`, {
        credentials: "include"
      });
      if (reviewsRes.ok) {
        const revData = await reviewsRes.json();
        setReviews(revData || []);
      }

      // Fetch patient's appointments (to find who they visited and paid)
      const appRes = await fetch(`${apiUrl}/api/appointments/patient`, {
        credentials: "include"
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        // Filter unique doctors they visited (must be paid or completed)
        const paidApps = appData.filter(app => app.paymentStatus === "paid");
        setAppointments(paidApps || []);
      }
    } catch (error) {
      console.error("Error fetching review page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter unique doctors from appointments list to prevent duplicate reviews in the form
  const uniqueDoctors = Array.from(
    new Map(appointments.map(app => [app.doctorId, { id: app.doctorId, name: app.doctorName }])).values()
  );

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedDoctorId || !reviewText.trim()) {
      Swal.fire("Warning", "Please select a doctor and write a review.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          rating,
          reviewText
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Submitted",
          text: "Your review has been successfully posted!",
          timer: 1500,
          showConfirmButton: false
        });
        setReviewText("");
        setSelectedDoctorId("");
        setRating(5);
        fetchData();
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to submit review.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Review?",
      text: "Are you sure you want to remove this feedback? This will update the doctor's average rating.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete It"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/reviews/${id}`, {
            method: "DELETE",
            credentials: "include"
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Review has been removed.",
              timer: 1500,
              showConfirmButton: false
            });
            fetchData();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to delete.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const handleEdit = async (id, currentRating, currentText) => {
    Swal.fire({
      title: "Update Your Review",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Rating</label>
            <select id="edit-rating" class="swal2-input !mx-0 !w-full">
              <option value="5" ${currentRating === 5 ? "selected" : ""}>5 Stars - Excellent</option>
              <option value="4" ${currentRating === 4 ? "selected" : ""}>4 Stars - Very Good</option>
              <option value="3" ${currentRating === 3 ? "selected" : ""}>3 Stars - Good</option>
              <option value="2" ${currentRating === 2 ? "selected" : ""}>2 Stars - Poor</option>
              <option value="1" ${currentRating === 1 ? "selected" : ""}>1 Star - Very Bad</option>
            </select>
          </div>
          <div class="mt-3">
            <label class="block text-xs font-bold text-slate-500 mb-1">Review Text</label>
            <textarea id="edit-text" class="swal2-textarea !mx-0 !w-full" rows="3">${currentText}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Review",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      preConfirm: () => {
        const ratingVal = document.getElementById("edit-rating").value;
        const textVal = document.getElementById("edit-text").value;
        if (!textVal.trim()) {
          Swal.showValidationMessage("Please write a review.");
        }
        return { rating: Number(ratingVal), reviewText: textVal };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { rating: updatedRating, reviewText: updatedText } = result.value;
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/reviews/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ rating: updatedRating, reviewText: updatedText })
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Updated",
              text: "Review has been modified.",
              timer: 1500,
              showConfirmButton: false
            });
            fetchData();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to update review.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading reviews panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Reviews</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Share your consultation experience and help other patients find care.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Write a New Review Form */}
        <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-5 h-fit">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiPlus className="mr-1.5" /> Write Review
          </h2>

          {uniqueDoctors.length > 0 ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {uniqueDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Rating Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Poor</option>
                  <option value="1">1 Star - Very Bad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Feedback Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your detailed feedback..."
                  rows="3"
                  className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-450 italic">
              You must complete and pay for at least one appointment before you can write a review.
            </p>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="lg:col-span-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiMessageSquare className="mr-1.5" /> Submitted Reviews ({reviews.length})
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div 
                  key={rev._id}
                  className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 relative text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white">Review ID / Details</h4>
                      <div className="flex items-center text-amber-500 text-xs font-bold mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500" : "text-slate-200 dark:text-slate-800"}`} 
                          />
                        ))}
                        <span className="ml-1.5 text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleEdit(rev._id, rev.rating, rev.reviewText)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-950 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors text-slate-500 cursor-pointer"
                        title="Edit Review"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-650 dark:bg-slate-950 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors text-slate-500 cursor-pointer"
                        title="Delete Review"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 italic text-xs">
              You haven't submitted any reviews yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
