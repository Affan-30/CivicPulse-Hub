import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RegisterGrievance = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    district: '',
    description: '',
    file: null,
    latitude: null,
    longitude: null
  });

  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([17.670719, 75.900950]); // Solapur default
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const mapRef = useRef();

  // REVERSE GEOCODE: Get area name from lat/lng
  const reverseGeocode = async (lat, lng) => {
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();

      // Extract most precise location name
      const addressParts = [];

      if (data.address.road) addressParts.push(data.address.road);
      if (data.address.suburb) addressParts.push(data.address.suburb);
      if (data.address.neighbourhood) addressParts.push(data.address.neighbourhood);
      if (data.address.city_district) addressParts.push(data.address.city_district);
      if (data.address.city) addressParts.push(data.address.city);
      if (data.address.district) addressParts.push(data.address.district);
      if (data.address.state) addressParts.push(data.address.state);

      const fullAddress = addressParts.join(', ') || data.display_name || 'Area';

      return fullAddress;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Interactive pin drop with reverse geocoding
  const LocationMarker = ({ onPinDrop }) => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;

        // Show loading while geocoding
        const areaName = await reverseGeocode(lat, lng);

        // Update form with precise area name
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          district: areaName
        }));

        onPinDrop(lat, lng);
      }
    });
    return null;
  };

  const handlePinDrop = (lat, lng) => {
    setMapCenter([lat, lng]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");

    const fd = new FormData();
    fd.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            category: formData.category,
            district: formData.district,
            description: formData.description,
            latitude: formData.latitude,
            longitude: formData.longitude
          }),
        ],
        { type: "application/json" }
      )
    );

    if (formData.file) {
      fd.append("file", formData.file);
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/complaints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        alert(text || "Failed to submit grievance");
        return;
      }

      const saved = await res.json();
      alert(`Grievance Submitted! Reference ID: GRV-${saved.id}\n📍 Location: ${formData.district}`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className='mainbg h-full w-full '>
  <div className="max-w-5xl mx-auto p-4 rounded-lg shadow-md border-2 border-blue-500 mt-2 h-[97vh] overflow-auto bg-linear-to-l from-green-100 to-blue-100
  md:overflow-hidden
  sm:overflow-hidden">
    <div className="text-center mb-4 rounded-xl p-2">
      <h2 className="text-3xl font-bold text-blue-900 font-serif">Lodge a Grievance</h2>
    </div>

    {/* SINGLE FORM wrapping both columns */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* LEFT: Form Fields */}
      <div className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1.5">Category *</label>
          <select
            className="w-full p-1.5 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Department...</option>
            <option value="Electricity">Electricity</option>
            <option value="Roads">Roads</option>
            <option value="Water">Water</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Agriculture">Agriculture</option>
          </select>
        </div>

        {/* Location Details (auto-filled) */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1.5">Location Details *</label>
          <input
            type="text"
            placeholder="Pin location name appears here (editable)"
            className="w-full p-1.5 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1.5">Description *</label>
          <textarea
            rows="2"
            placeholder="Please describe your issue in detail..."
            className="w-full p-2 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-600 p-3 text-center rounded-lg ">
          <p className="text-sm text-gray-500 mb-1">📷 Attach Photo Evidence (Optional)</p>
          <input 
            type="file" 
            accept="image/*"
            className="mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-green-500 hover:file:text-green-100"
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] || null })}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.category || !formData.description || !formData.latitude}
          className="w-full bg-linear-to-r from-blue-500 to-green-600 hover:from-green-500 hover:to-blue-600 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300  py-3 text-base disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Submitting Grievance...' : '🚀 Submit Grievance'}
        </button>
      </div>

      {/* RIGHT: Interactive Map */}
        <div className="bg-linear-to-l from-green-200 to-blue-200 p-1.5 rounded-xl border-2 h-110 border-gray-500 space-y-4">
          <div className="flex items-center mt-0 mb-2 ml-1">
            <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center mr-2 text-white font-bold text-xl">
              📍
            </div>
            <div className='mr-2'>
              <h3 className="text-xl font-bold text-blue-900 mr-2">Pin Your Location</h3>
            </div>
          </div>

          <div className="relative h-68 w-full rounded-xl overflow-hidden  border-2  border-gray-300">
            <MapContainer
              center={mapCenter}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              <LocationMarker onPinDrop={handlePinDrop} />
              {formData.latitude && formData.longitude && (
                <Marker position={[formData.latitude, formData.longitude]} />
              )}
            </MapContainer>
            
            {reverseGeocoding && (
              <div className="absolute top-2 right-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-blue-600 border border-blue-200 animate-pulse">
                🔍 Finding area name...
              </div>
            )}
          </div>

          {formData.latitude && (
            <div className="p-1.5 bg-green-50 border-2 border-green-200 rounded-xl">
              
              <div className="text-base text-green-700 bg-white px-2 py-1 rounded-lg border-2 border-green-100 font-medium mb-1">
                📍 {formData.district}
              </div>
            </div>
          )} 
        </div>
    </form>
  </div>
  </div>
);

};

export default RegisterGrievance;
