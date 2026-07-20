"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "../../../lib/auth-context";
import { authFetch } from "../../../lib/auth-client";
import Swal from "sweetalert2";
import { 
  FiHeart, 
  FiActivity, 
  FiMapPin, 
  FiClock, 
  FiStar, 
  FiBookOpen, 
  FiAlertCircle, 
  FiUser,
  FiLoader,
  FiMessageSquare
} from "react-icons/fi";

export default function DoctorDetails() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState(null); // { dayName, dateLabel, dateString }
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchDoctorDetails() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/doctors/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDoctor(data);
        } else {
          Swal.fire({
            icon: "error",
            title: "Not Found",
            text: "Doctor profile could not be loaded."
          });
          router.push("/doctors");
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctorDetails();
  }, [id]);

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    const weekdayOptions = { weekday: "long" };
    const dateOptions = { month: "short", day: "numeric" };
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", weekdayOptions); // e.g. "Monday"
      const dateLabel = d.toLocaleDateString("en-US", dateOptions); // e.g. "Jul 20"
      const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
      days.push({ dayName, dateLabel, dateString });
    }
    return days;
  };

  const next7Days = getNext7Days();

  // Check if a day is in the doctor's available days
  const isAvailableDay = (dayName) => {
    if (!doctor || !doctor.availableDays) return false;
    return doctor.availableDays.some(
      (d) => d.toLowerCase() === dayName.toLowerCase()
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!session) {
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please sign in to book an appointment.",
        confirmButtonText: "Sign In",
        confirmButtonColor: "#059669"
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/login?redirect=/doctors/${id}`);
        }
      });
      return;
    }

    if (session.user.role !== "patient") {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "Only patients can book consultations."
      });
      return;
    }

    if (!selectedDate || !selectedSlot) {
      Swal.fire({
        icon: "warning",
        title: "Select Slot",
        text: "Please select an available date and time slot."
      });
      return;
    }

    setBookingLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      // Step 1: Book the appointment
      const response = await authFetch(`${apiUrl}/api/appointments/book`, {
        method: "POST",
        body: JSON.stringify({
          doctorId: doctor._id.toString(),
          doctorName: doctor.doctorName,
          specialization: doctor.specialization,
          appointmentDate: selectedDate.dateString,
          appointmentTime: selectedSlot,
          consultationFee: doctor.consultationFee,
          symptoms
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to book appointment.");
      }

      const appointmentId = resData.appointment._id;

      // Step 2: Create Stripe Checkout Session and get the URL
      const checkoutRes = await authFetch(`${apiUrl}/api/payments/create-checkout-session`, {
        method: "POST",
        body: JSON.stringify({ appointmentId })
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Failed to create checkout session.");
      }

      // Step 3: Redirect directly to Stripe's hosted checkout page
      window.location.href = checkoutData.url;

    } catch (error) {
      console.error("Booking error:", error);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: error.message || "Something went wrong while booking."
      });
    } finally {
      setBookingLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <FiLoader className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide">
          Loading doctor details...
        </p>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Profile Header Card */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start text-left">
        <img
          src={doctor.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doctor.doctorName}`}
          alt={doctor.doctorName}
          className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0"
        />
        <div className="space-y-4 flex-grow">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {doctor.specialization || "Specialist"}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {doctor.doctorName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center">
              <FiMapPin className="mr-1.5 text-slate-400" /> {doctor.hospitalName}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience</p>
              <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{doctor.experience} Years</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating</p>
              <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5 flex items-center">
                <FiStar className="fill-amber-500 text-amber-500 mr-1 shrink-0" />
                {doctor.averageRating || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fee</p>
              <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">${doctor.consultationFee}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider mt-1 px-1.5 py-0.25 rounded ${
                doctor.verificationStatus === "verified"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/30"
              }`}>
                {doctor.verificationStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Info Left Column */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Qualifications */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
            <h2 className="flex items-center text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FiBookOpen className="mr-2 text-emerald-600 dark:text-emerald-455" /> Qualifications & Biography
            </h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-450 text-sm">
              {doctor.qualifications && doctor.qualifications.length > 0 ? (
                doctor.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 mt-2 shrink-0" />
                    <span>{qual}</span>
                  </li>
                ))
              ) : (
                <p className="text-xs text-slate-450 italic">No qualifications specified yet.</p>
              )}
            </ul>
          </div>

          {/* Patient Reviews */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
            <h2 className="flex items-center text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FiMessageSquare className="mr-2 text-emerald-600 dark:text-emerald-455" /> Reviews ({doctor.totalReviews})
            </h2>
            <div className="space-y-4">
              {doctor.reviews && doctor.reviews.length > 0 ? (
                doctor.reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-slate-100 dark:border-slate-800/60 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rev.patientPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.patientName}`}
                          alt={rev.patientName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{rev.patientName}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <FiStar className="fill-amber-500 mr-1 shrink-0" /> {rev.rating}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-2.5 pl-11">
                      "{rev.reviewText}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-450 italic">No reviews written for this doctor yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Booking Right Column */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Availability Calendar & Form */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm sticky top-24">
            <h2 className="flex items-center text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FiClock className="mr-2 text-emerald-600 dark:text-emerald-455" /> Book Consultation
            </h2>
            
            <form onSubmit={handleBooking} className="space-y-5">
              
              {/* Availability Calendar (Option 2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2.5">
                  1. Select Date
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {next7Days.map((day) => {
                    const isAvailable = isAvailableDay(day.dayName);
                    const isSelected = selectedDate?.dateString === day.dateString;
                    return (
                      <button
                        key={day.dateString}
                        type="button"
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedDate(day);
                            setSelectedSlot("");
                          }
                        }}
                        disabled={!isAvailable}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/25"
                            : isAvailable
                            ? "border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300"
                            : "border-slate-100 dark:border-slate-900 opacity-30 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-60">
                          {day.dayName.substring(0, 3)}
                        </span>
                        <span className="text-xs font-extrabold mt-1">
                          {day.dateLabel.split(" ")[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots List */}
              {selectedDate && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                    2. Available Time Slots
                  </label>
                  {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {doctor.availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent"
                                : "border-slate-200 dark:border-slate-800 text-slate-700 hover:border-emerald-500 dark:text-slate-300"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No available time slots configured.</p>
                  )}
                </div>
              )}

              {/* Symptoms Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  3. Describe Symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your current medical condition or general symptoms..."
                  rows="3"
                  className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>

              {/* Fee Notice */}
              <div className="rounded-2xl border border-emerald-150 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/15 flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Consultation Fee:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                  ${doctor.consultationFee}
                </span>
              </div>

              <button
                type="submit"
                disabled={bookingLoading || !selectedDate || !selectedSlot}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg cursor-pointer"
              >
                {bookingLoading ? <FiLoader className="animate-spin w-5 h-5 mr-2" /> : "Confirm Slot & Pay"}
              </button>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
