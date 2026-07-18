"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FiSearch, 
  FiHeart, 
  FiActivity, 
  FiCompass, 
  FiShield, 
  FiCalendar, 
  FiAward, 
  FiChevronRight, 
  FiStar,
  FiUsers,
  FiMessageSquare,
  FiTrendingUp
} from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";

export default function Home() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalReviews: 0
  });
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        // Fetch stats
        const statsRes = await fetch(`${apiUrl}/api/users/public-stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch featured doctors
        const doctorsRes = await fetch(`${apiUrl}/api/doctors?limit=3&sort=rating`);
        if (doctorsRes.ok) {
          const docData = await doctorsRes.json();
          setFeaturedDoctors(docData.doctors || []);
        }

        // Fetch recent reviews
        const reviewsRes = await fetch(`${apiUrl}/api/reviews/recent`);
        if (reviewsRes.ok) {
          const revData = await reviewsRes.json();
          setRecentReviews(revData || []);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const specializations = [
    { name: "Cardiology", icon: <FiHeart className="w-8 h-8 text-red-500" />, desc: "Heart and cardiovascular health" },
    { name: "Neurology", icon: <FiActivity className="w-8 h-8 text-indigo-500" />, desc: "Brain and nervous system disorders" },
    { name: "Orthopedics", icon: <FiCompass className="w-8 h-8 text-emerald-500" />, desc: "Bone, joint, and muscle care" },
    { name: "Pediatrics", icon: <FiAward className="w-8 h-8 text-amber-500" />, desc: "Child healthcare and diagnostics" },
    { name: "Dermatology", icon: <FiShield className="w-8 h-8 text-pink-500" />, desc: "Skin, hair, and nail treatments" }
  ];

  const benefits = [
    { 
      title: "Verified Specialists", 
      desc: "Consult only with licensed, credential-verified medical professionals approved by our administration.",
      icon: <FiShield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    { 
      title: "Seamless Booking", 
      desc: "Browse doctor availability, select a slot that works for you, and pay securely via Stripe in seconds.",
      icon: <FiCalendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
    },
    { 
      title: "AI Symptom Helper", 
      desc: "Describe your symptoms to our virtual diagnostic helper powered by Gemini to find the right specialist.",
      icon: <FiActivity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    },
    { 
      title: "Prescription Management", 
      desc: "Receive digital diagnoses and treatment details directly inside your secure patient dashboard.",
      icon: <FiAward className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    }
  ];

  return (
    <div className="overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-8 pb-16 px-6 md:px-12 lg:px-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-400/20 dark:bg-emerald-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-400/20 dark:bg-cyan-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider"
            >
              <FiActivity className="animate-pulse" />
              <span>Modern Healthcare Solutions</span>
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
            >
              Your Health Journey,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
                Simplified
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed"
            >
              Connect with top certified medical experts, schedule online consultations, manage digital prescriptions, and use AI-driven diagnostics to discover matching specializations.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <Link 
                href="/doctors"
                className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
              >
                <span>Find a Doctor</span>
                <FiChevronRight />
              </Link>
              <Link 
                href="/register"
                className="flex items-center justify-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              >
                <span>Join as Patient</span>
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Medico Assistant</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 text-sm">
                  💡 <strong>Tip:</strong> Book verified specialists for Cardiology or Neurology directly.
                </div>
                <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-900/50 text-sm">
                  🤖 <strong>AI Symptom Checker:</strong> Use patient dashboard to analyze symptoms instantly.
                </div>
              </div>
              <div className="flex items-center space-x-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="w-10 h-10 rounded-full bg-slate-150 dark:bg-slate-850 flex items-center justify-center">
                  <FaUserMd className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">24/7 Virtual Support</h4>
                  <p className="text-xs text-slate-400">Immediate scheduling & guidance</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800/60 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-1">
            <div className="flex justify-center text-emerald-600 dark:text-emerald-455 mb-2">
              <FaUserMd className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">
              {loading ? "..." : stats.totalDoctors}
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Doctors</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex justify-center text-cyan-600 dark:text-cyan-455 mb-2">
              <FiUsers className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">
              {loading ? "..." : stats.totalPatients}
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Patients</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex justify-center text-indigo-600 dark:text-indigo-455 mb-2">
              <FiCalendar className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">
              {loading ? "..." : stats.totalAppointments}
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Successful Bookings</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex justify-center text-purple-600 dark:text-purple-455 mb-2">
              <FiMessageSquare className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">
              {loading ? "..." : stats.totalReviews}
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Reviews</p>
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Explore Specializations</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Select a clinical category below to filter available experts and schedule a consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {specializations.map((spec) => (
              <Link 
                key={spec.name} 
                href={`/doctors?specialization=${spec.name}`}
                className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:border-emerald-500 dark:bg-slate-900 dark:hover:border-emerald-400 transition-all hover:shadow-lg text-center flex flex-col items-center justify-between"
              >
                <div className="p-4 rounded-xl bg-slate-50 group-hover:bg-emerald-50 dark:bg-slate-950 dark:group-hover:bg-emerald-950/20 transition-colors">
                  {spec.icon}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {spec.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800/60 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-3 text-left">
              <h2 className="text-3xl font-bold tracking-tight">Featured Doctors</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Meet our highest-rated and qualified medical experts verified by Medico.
              </p>
            </div>
            <Link 
              href="/doctors" 
              className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              <span>View All Doctors</span>
              <FiChevronRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : featuredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredDoctors.map((doc) => (
                <div 
                  key={doc._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow text-left"
                >
                  <div className="space-y-4">
                    <img 
                      src={doc.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.doctorName}`} 
                      alt={doc.doctorName}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-750 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {doc.specialization}
                      </span>
                      <h3 className="font-bold text-lg mt-2 text-slate-900 dark:text-white truncate">
                        {doc.doctorName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{doc.hospitalName}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 dark:border-slate-800 mt-6 pt-4 space-y-3">
                    <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Experience: <strong>{doc.experience} Years</strong></span>
                      <span className="flex items-center text-amber-500">
                        <FiStar className="fill-amber-500 mr-1" />
                        <strong>{doc.averageRating || "N/A"}</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-950 dark:text-white">
                        ${doc.consultationFee} <span className="text-xs font-normal text-slate-400">fee</span>
                      </span>
                      <Link
                        href={`/doctors/${doc._id}`}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
              No doctors verified yet. Please check back later.
            </div>
          )}
        </div>
      </section>

      {/* Testimonials (Success Stories) Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Patient Success Stories</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Read real feedback from patients who consulted specialists and received treatment via Medico.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : recentReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentReviews.map((rev) => (
                <div 
                  key={rev._id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-4 h-4 ${i < rev.rating ? "fill-amber-500" : "text-slate-200 dark:text-slate-800"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm italic text-slate-650 dark:text-slate-350 line-clamp-3 leading-relaxed">
                      "{rev.reviewText}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 border-t border-slate-100 dark:border-slate-800 mt-6 pt-4">
                    <img 
                      src={rev.patientPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.patientName}`} 
                      alt={rev.patientName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rev.patientName}
                      </h4>
                      <p className="text-[10px] text-slate-400">Patient</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No testimonials shared yet. Patients will add reviews after consultations.
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Medico Section */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200/50 dark:border-slate-850 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose Medicare Connect?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We digitize patient care to reduce waiting times, improve scheduling, and ensure safe treatments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:shadow-md transition-shadow text-left space-y-4"
              >
                <div className="p-3 w-fit rounded-xl bg-slate-50 dark:bg-slate-950">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact Anchor info */}
      <section id="about" className="py-20 border-t border-slate-200/60 dark:border-slate-800/60 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">About Medicare Connect</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-2xl mx-auto">
            Medicare Connect is a state-of-the-art healthcare management platform designed to close the gap between healthcare seekers and medical specialists. By offering online schedule management, review sharing, direct Stripe checkout, and Gemini-based medical classifications, we ensure a premium care environment for everyone.
          </p>
          <div className="pt-4 flex justify-center space-x-3">
            <div className="w-16 h-0.5 bg-emerald-500 rounded-full" />
            <div className="w-4 h-0.5 bg-cyan-500 rounded-full" />
          </div>
        </div>
      </section>

    </div>
  );
}
