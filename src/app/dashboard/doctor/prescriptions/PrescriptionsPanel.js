"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiFileText, FiPlus, FiEdit2, FiPlusCircle, FiLoader, FiUser } from "react-icons/fi";
import Swal from "sweetalert2";

export default function PrescriptionsPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const appointmentId = searchParams.get("appointmentId");
  const patientId = searchParams.get("patientId");

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Prescription Form state
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/prescriptions/doctor`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data || []);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleCreatePrescription = async (e) => {
    e.preventDefault();

    if (!diagnosis || !medications) {
      Swal.fire("Warning", "Diagnosis and medications are required fields.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientId,
          appointmentId,
          diagnosis,
          medications,
          notes
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Prescription Created",
          text: "Treatment plan has been successfully logged for the patient.",
          timer: 1500,
          showConfirmButton: false
        });
        
        setDiagnosis("");
        setMedications("");
        setNotes("");
        
        // Remove query parameters from URL
        router.replace("/dashboard/doctor/prescriptions");
        fetchPrescriptions();
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to log prescription.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrescription = async (id, curDiagnosis, curMeds, curNotes) => {
    Swal.fire({
      title: "Edit Prescription",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-505 mb-1">Diagnosis</label>
            <input type="text" id="edit-diag" class="swal2-input !mx-0 !w-full" value="${curDiagnosis}">
          </div>
          <div class="mt-3">
            <label class="block text-xs font-bold text-slate-505 mb-1">Medications</label>
            <textarea id="edit-meds" class="swal2-textarea !mx-0 !w-full" rows="3">${curMeds}</textarea>
          </div>
          <div class="mt-3">
            <label class="block text-xs font-bold text-slate-505 mb-1">Doctor Notes</label>
            <textarea id="edit-notes" class="swal2-textarea !mx-0 !w-full" rows="2">${curNotes || ""}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      preConfirm: () => {
        const diag = document.getElementById("edit-diag").value;
        const meds = document.getElementById("edit-meds").value;
        const notesVal = document.getElementById("edit-notes").value;
        if (!diag.trim() || !meds.trim()) {
          Swal.showValidationMessage("Diagnosis and medications are required fields.");
        }
        return { diagnosis: diag, medications: meds, notes: notesVal };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { diagnosis: updatedDiag, medications: updatedMeds, notes: updatedNotes } = result.value;
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/prescriptions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              diagnosis: updatedDiag,
              medications: updatedMeds,
              notes: updatedNotes
            })
          });

          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Updated",
              text: "Prescription details updated successfully.",
              timer: 1500,
              showConfirmButton: false
            });
            fetchPrescriptions();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to update prescription.");
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
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading prescriptions records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Prescription Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Log new medical treatment plans and view patient history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Conditional Create Prescription Form */}
        {appointmentId && patientId && (
          <div className="lg:col-span-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
              <FiPlusCircle className="mr-1.5 text-emerald-600" /> Log Treatment Plan
            </h2>

            <form onSubmit={handleCreatePrescription} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Diagnosis / Medical Finding
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Migraine or Hypertension"
                    className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Doctor Notes / General Directions
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="General advice: Stay hydrated, rest, follow up in 2 weeks..."
                    rows="4"
                    className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Medications & Dosages
                  </label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="1. Paracetamol 500mg - 3 times daily after meals&#10;2. Ibuprofen 400mg - as needed for pain..."
                    rows="6"
                    className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => router.replace("/dashboard/doctor/prescriptions")}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Discard Form
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 transition-colors cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Submit Prescription"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Existing Prescriptions List */}
        <div className="lg:col-span-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiFileText className="mr-1.5" /> Logged Treatment Plans ({prescriptions.length})
          </h2>

          {prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.map((pres) => (
                <div 
                  key={pres._id} 
                  className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 relative hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Patient Record</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Logged: {new Date(pres.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleEditPrescription(pres._id, pres.diagnosis, pres.medications, pres.notes)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-950 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-colors text-slate-500 cursor-pointer animate-fade-in"
                      title="Edit Prescription"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Diagnosis</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{pres.diagnosis}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Medications</span>
                      <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap text-[11px] line-clamp-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 leading-relaxed">
                        {pres.medications}
                      </p>
                    </div>
                    {pres.notes && (
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Notes</span>
                        <p className="text-slate-500 dark:text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{pres.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 italic text-xs">
              No prescriptions registered yet. Use "Appointment Requests" to complete a session and log new treatment instructions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
