"use client";

import { useEffect, useState } from "react";
import { FiSave, FiAward, FiDollarSign, FiActivity, FiMapPin, FiCamera, FiLoader } from "react-icons/fi";
import { authFetch } from "../../../../lib/auth-client";
import Swal from "sweetalert2";

export default function DoctorProfile() {
  const [specialization, setSpecialization] = useState("Cardiology");
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState(0);
  const [consultationFee, setConsultationFee] = useState(0);
  const [hospitalName, setHospitalName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await authFetch(`${apiUrl}/api/doctors/my-profile`);
        if (response.ok) {
          const data = await response.json();
          setSpecialization(data.specialization || "Cardiology");
          setQualifications(data.qualifications?.join(", ") || "");
          setExperience(data.experience || 0);
          setConsultationFee(data.consultationFee || 0);
          setHospitalName(data.hospitalName || "");
          setPhotoUrl(data.profileImage || "");
        }
      } catch (error) {
        console.error("Error loading doctor profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPhotoUrl(data.data.url);
        Swal.fire({
          icon: "success",
          title: "Image Hosted",
          text: "Profile photo successfully updated!",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      Swal.fire("Error", "Could not upload image to Imgbb.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!hospitalName || !consultationFee || !specialization) {
      Swal.fire("Warning", "Please complete all required fields.", "warning");
      return;
    }

    setSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const payload = {
        specialization,
        qualifications: qualifications.split(",").map((q) => q.trim()).filter((q) => q !== ""),
        experience: Number(experience) || 0,
        consultationFee: Number(consultationFee) || 0,
        hospitalName,
        profileImage: photoUrl
      };

      const response = await authFetch(`${apiUrl}/api/doctors/profile`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Profile Saved!",
          text: "Your professional details have been successfully updated.",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to update profile.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const specOptions = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading professional profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Professional Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          এখানে আপনার <strong className="text-emerald-600">Visiting Fee (Consultation Fee)</strong>, hospital, specialization এবং qualifications set করুন।
          Patients আপনার profile দেখে এই তথ্যের ভিত্তিতে appointment নেবে।
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Photo Upload */}
        <div className="flex items-center space-x-6 border-b border-slate-100 dark:border-slate-850 pb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Doctor" className="w-full h-full object-cover" />
              ) : uploadingImage ? (
                <FiLoader className="w-6 h-6 text-emerald-500 animate-spin" />
              ) : (
                <FiCamera className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-md transition-colors">
              <FiCamera className="w-4 h-4" />
              <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
            </label>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Profile Photo</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">Upload a clear clinical portrait image. Links directly to public practitioner card.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specialization */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Medical Specialization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiActivity />
              </div>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {specOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospital Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Affiliated Hospital Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiMapPin />
              </div>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. City Central Clinic"
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Years of Experience
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiAward />
              </div>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                placeholder="e.g. 8"
                min="0"
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              💰 Visiting Fee / Consultation Fee (USD per session)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiDollarSign />
              </div>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                placeholder="e.g. 150 — প্রতি visit এ patient কত টাকা দেবে"
                min="0"
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">এটাই হবে patient দের appointment payment amount (Stripe এ charge হবে)।</p>
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Qualifications / Biography (Comma Separated)
          </label>
          <textarea
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            placeholder="e.g. MD in General Medicine, Fellow of American College of Surgeons, MBBS..."
            rows="3"
            className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Separate entries with commas. Rendered as highlights on details profile.</span>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-500/15 cursor-pointer mt-4"
        >
          {saving ? <FiLoader className="animate-spin w-4 h-4 mr-2" /> : <FiSave className="mr-2" />}
          <span>Save Changes</span>
        </button>

      </form>
    </div>
  );
}
