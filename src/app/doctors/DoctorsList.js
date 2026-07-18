"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiStar, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser
} from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";

export default function DoctorsList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state
  const initialSpec = searchParams.get("specialization") || "All";
  const initialSearch = searchParams.get("search") || "";

  // Component state
  const [doctors, setDoctors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [specialization, setSpecialization] = useState(initialSpec);
  const [sort, setSort] = useState("rating");
  const [layoutMode, setLayoutMode] = useState("card"); // "card" or "table"
  const [loading, setLoading] = useState(true);

  // Sync state with URL parameter (for specialization redirects from homepage)
  useEffect(() => {
    const specParam = searchParams.get("specialization");
    if (specParam) {
      setSpecialization(specParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const queryParams = new URLSearchParams({
          search,
          specialization: specialization === "All" ? "" : specialization,
          sort,
          page: currentPage.toString(),
          limit: "6"
        });

        const response = await fetch(`${apiUrl}/api/doctors?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (error) {
        console.error("Error fetching doctors list:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [specialization, sort, currentPage]); // Re-fetch on filter change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Force reload by state trigger
    setSpecialization(specialization);
  };

  const handleSpecSelect = (spec) => {
    setSpecialization(spec);
    setCurrentPage(1);
    // Update URL query cleanly
    const params = new URLSearchParams(window.location.search);
    if (spec === "All") {
      params.delete("specialization");
    } else {
      params.set("specialization", spec);
    }
    router.replace(`/doctors?${params.toString()}`, { scroll: false });
  };

  const specOptions = ["All", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-left mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Find a Doctor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Book online consultations with verified medical specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Filters Sidebar (Desktop) */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="flex items-center text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FiFilter className="mr-2" /> Filter Specialization
            </h2>
            <div className="space-y-1.5">
              {specOptions.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecSelect(spec)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    specialization === spec
                      ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-white"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Content */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm">
            
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or keyword..."
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </form>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              {/* Sorting Select */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="experience">Experience</option>
                  <option value="fee-low-to-high">Fee: Low to High</option>
                  <option value="fee-high-to-low">Fee: High to Low</option>
                </select>
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setLayoutMode("card")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    layoutMode === "card"
                      ? "bg-white text-emerald-600 dark:bg-slate-900 dark:text-emerald-455 shadow-sm"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                  title="Card Grid"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode("table")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    layoutMode === "table"
                      ? "bg-white text-emerald-600 dark:bg-slate-900 dark:text-emerald-455 shadow-sm"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                  title="List Table"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Doctors Listings */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 w-full bg-slate-100 dark:bg-slate-900/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            layoutMode === "card" ? (
              // Card Grid Layout
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-left"
                  >
                    <div className="flex space-x-4">
                      <img
                        src={doc.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.doctorName}`}
                        alt={doc.doctorName}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                      />
                      <div className="space-y-1 truncate">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {doc.specialization}
                        </span>
                        <h3 className="font-bold text-slate-950 dark:text-white truncate">
                          {doc.doctorName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.hospitalName}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-5 pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Experience: <strong>{doc.experience} Years</strong></span>
                      <span className="flex items-center text-amber-500">
                        <FiStar className="fill-amber-500 mr-1" />
                        <strong>{doc.averageRating || "N/A"}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-base font-bold text-slate-950 dark:text-white">
                        ${doc.consultationFee} <span className="text-[10px] font-normal text-slate-400">fee</span>
                      </span>
                      <Link
                        href={`/doctors/${doc._id}`}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Table List Layout (Optional Requirement 4)
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Doctor</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Specialization</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Rating</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Hospital</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Fee</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      {doctors.map((doc) => (
                        <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                            <img
                              src={doc.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.doctorName}`}
                              alt={doc.doctorName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{doc.doctorName}</div>
                              <div className="text-[10px] text-slate-450">{doc.experience} Years Exp</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                              {doc.specialization}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center text-amber-500 font-bold">
                              <FiStar className="fill-amber-500 mr-1" />
                              {doc.averageRating || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            {doc.hospitalName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                            ${doc.consultationFee}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              href={`/doctors/${doc._id}`}
                              className="inline-block rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors"
                            >
                              Book
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 text-slate-400">
              No specialists match the selected criteria.
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === index + 1
                      ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                      : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
