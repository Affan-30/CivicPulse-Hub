import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, User, Clock, Edit3 } from 'react-feather';
import Navbar from './Navbar'; // Your existing navbar

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState({ open: false, complaintId: null });
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);


  const token = localStorage.getItem('jwtToken');
  const officerName = localStorage.getItem('userName') || 'Officer';
  const officerDepartment = localStorage.getItem('officerDepartment') || 'Department';

  // Stats
  const pendingCount = complaints.filter(c => c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved - Pending Review').length;

  // Fetch assigned complaints
  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/complaints/my-assigned', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error('Failed to fetch assigned complaints');
        return;
      }

      const data = await res.json();
      console.log(data);
      console.log(data.proofImg);

      setComplaints(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resolve complaint
  const handleResolve = async () => {
    try {
      const formData = new FormData();
      formData.append("resolutionNotes", resolutionNotes);

      if (proofImage) {
        formData.append("file", proofImage);
      }

      const res = await fetch(
        `http://localhost:8080/api/complaints/${resolveModal.complaintId}/resolve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
            // ❌ DO NOT set Content-Type manually
          },
          body: formData
        }
      );

      if (res.ok) {
        alert("Complaint marked as resolved! Waiting for admin review.");
        setResolveModal({ open: false, complaintId: null });
        setResolutionNotes("");
        setProofImage(null);
        fetchAssignedComplaints(); // Refresh
      } else {
        alert("Failed to resolve complaint");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to resolve complaint");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-blue-600">Loading your assigned complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* <Navbar /> */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-full mb-4 shadow-lg">
            <User className="w-6 h-6 mr-2" />
            <span className="text-xl font-bold">Welcome, {officerName}</span>
            <span className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-blue-500 font-extrabold">
              {officerDepartment}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Assigned Complaints
          </h1>
          <p className="text-xl text-gray-600">
            Resolve issues reported by citizens in your department
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-orange-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-12 h-12 text-orange-500" />
              <div className="text-3xl font-bold text-gray-800">{complaints.length}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Assigned</h3>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-blue-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-12 h-12 text-blue-500" />
              <div className="text-3xl font-bold text-gray-800">{pendingCount}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Pending Action</h3>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-green-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div className="text-3xl font-bold text-gray-800">{resolvedCount}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-purple-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-12 h-12 text-purple-500" />
              <div className="text-3xl font-bold text-gray-800">
                {complaints.filter(c => c.status === 'Completed').length}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-500" />
              Assigned Complaints List
            </h2>
            {complaints.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No complaints assigned yet</p>
              </div>
            )}
          </div>

          {complaints.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Citizen ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">User feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{complaint.id}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm font-medium text-gray-900 max-w-4">
                        {complaint.citizenId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {complaint.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-6  whitespace-break-spaces">
                        {complaint.district}
                      </td>

                      <td className="px-6 py-4 whitespace-wrap text-sm font-medium text-gray-900">
                        {complaint.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {complaint.imagePath ? (
                          <img
                            src={complaint.imagePath}
                            alt="evidence"
                            className="h-20 w-100 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold max-w-2.5 ${complaint.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : complaint.status === 'Resolved - Pending Review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                          }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {complaint.status === 'Assigned' && (
                          <button
                            onClick={() => setResolveModal({
                              open: true,
                              complaintId: complaint.id,
                              complaintTitle: complaint.description,
                            })}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <span className='text-wrap'>{complaint.resolutionNotes}</span>
                        <span>
                            {complaint.proofImg ?(<img
                          src={complaint.proofImg}
                          className="h-15 pt-1 w-25 object-cover rounded-xl"
                        />):(
                          <span></span>
                        )}
                        </span>
                      </td>
                      <td className='text-sm px-4 py-2'>
                        {complaint.feedback ? (
                          <div className="flex flex-col items-center gap-2">
                            {/* Stars if rating exists */}
                            {complaint.rating && (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      viewBox="0 0 24 24"
                                      className={`w-4 h-4 ${star <= complaint.rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                      fill="currentColor"
                                    >
                                      <path d="M12 .587l3.668 7.428 8.332 1.213-6 5.828-1.484 7.276L12 21.113l-6.516 3.414-1.484-7.276-6-5.828 8.332-1.213L12 .587z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {complaint.rating} / 5
                                </span>
                              </div>
                            )}
                          <div className='bg-green-200 px-1 py-2 rounded-xl border-2 border-green-500'>
                            <span >{complaint.feedback}</span>
                          </div>
                          </div>
                        ) : (
                          <span>_</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Resolve Complaint
              </h3>
              <button
                onClick={() => setResolveModal({ open: false, complaintId: null })}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 font-medium">
                Complaint: {resolveModal.complaintTitle}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes *
                </label>
                <textarea
                  rows="2"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how you resolved this issue..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  required
                />
              </div>
              <div className="border border-dashed border-gray-600 p-3 text-center rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Proof Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofImage(e.target.files[0])}
                  className="mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-green-500 hover:file:text-green-100"
                />
              </div>


              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setResolveModal({ open: false, complaintId: null })}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={!resolutionNotes.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
