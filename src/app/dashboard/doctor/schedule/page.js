"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

export default function DoctorSchedule() {
  const [profile, setProfile] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/doctors/my-profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setAvailableDays(data.availableDays || []);
        setAvailableSlots(data.availableSlots || []);
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const weekdayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  const handleDayToggle = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlot.trim()) return;
    
    // Check duplication
    if (availableSlots.includes(newSlot.trim())) {
      Swal.fire("Warning", "Slot already exists.", "warning");
      return;
    }

    setAvailableSlots([...availableSlots, newSlot.trim()]);
    setNewSlot("");
  };

  const handleRemoveSlot = (slotToRemove) => {
    setAvailableSlots(availableSlots.filter((slot) => slot !== slotToRemove));
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const payload = {
        specialization: profile.specialization || "General",
        qualifications: profile.qualifications || [],
        experience: profile.experience || 0,
        consultationFee: profile.consultationFee || 0,
        hospitalName: profile.hospitalName || "General Clinic",
        profileImage: profile.profileImage || "",
        availableDays,
        availableSlots
      };

      const response = await fetch(`${apiUrl}/api/doctors/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Schedule Saved",
          text: "Your availability settings have been updated successfully.",
          timer: 1500,
          showConfirmButton: false
        });
        fetchProfile();
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to save schedule.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading availability settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manage Schedule</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure your active consulting days and hourly time slots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Available Days */}
        <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiCalendar className="mr-1.5" /> 1. Consulting Days
          </h2>
          
          <div className="space-y-2.5">
            {weekdayOptions.map((day) => {
              const isChecked = availableDays.includes(day);
              return (
                <label 
                  key={day}
                  className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-colors ${
                    isChecked
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="text-sm font-semibold">{day}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDayToggle(day)}
                    className="h-4.5 w-4.5 text-emerald-600 focus:ring-emerald-500 rounded border-slate-305 dark:border-slate-800 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Time Slots Config */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">
              <FiClock className="mr-1.5" /> 2. Hour Slots
            </h2>

            {/* Add Slot Form */}
            <form onSubmit={handleAddSlot} className="flex gap-2">
              <input
                type="text"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                placeholder="Example: '09:00 AM' or '04:30 PM'"
                className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 transition-colors cursor-pointer"
              >
                <FiPlus className="w-4 h-4 mr-1" /> Add
              </button>
            </form>

            {/* Slots List */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Current Configured Slots ({availableSlots.length})
              </label>
              {availableSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {availableSlots.map((slot) => (
                    <span 
                      key={slot}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <FiClock className="mr-1 text-slate-400" />
                      <span>{slot}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot)}
                        className="ml-2 text-red-500 hover:text-red-700 focus:outline-none cursor-pointer"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-450 italic py-4">No consulting slots added yet. Please add a slot above.</p>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/15 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Availability Schedule"}
          </button>
        </div>

      </div>
    </div>
  );
}
