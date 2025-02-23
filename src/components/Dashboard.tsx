import React, { useState, useEffect } from 'react';
import { LogOut, Briefcase, FileText, User, Save } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    linkedin: '',
    email: '',
    phone: '',
    uniqueTraits: ['', '', ''],
    resume: '' // ✅ Added resume field
  });

  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Fetch saved profile on load with Authorization
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("🚨 No token found. Redirecting to login...");
      return;
    }

    fetch("http://localhost:5001/api/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch((err) => console.error("❌ Failed to fetch profile:", err));
  }, []);

  // Save user profile to backend with Authorization
  const handleSaveProfile = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to save your profile.");
      return;
    }

    fetch("http://localhost:5001/api/profile", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then(() => alert("✅ Profile saved successfully!"))
      .catch((err) => console.error("❌ Failed to save profile:", err));
  };

  // ✅ Generate Cover Letter (Chronological or Short)
  const handleGenerateCoverLetter = async (type: 'chronological' | 'short') => {
    const endpoint =
      type === 'chronological'
        ? "http://localhost:5001/api/generate-chronological-cover-letter"
        : "http://localhost:5001/api/generate-short-cover-letter";

    try {
      console.log(`🔄 Generating ${type} cover letter...`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      console.log(`✅ ${type} Cover Letter Generated:`, data.coverLetter);
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Failed to generate cover letter.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-indigo-600">CareerLaunch</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-2 border rounded"
                value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <input type="text" placeholder="Address" className="w-full p-2 border rounded"
                value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              <input type="text" placeholder="LinkedIn URL" className="w-full p-2 border rounded"
                value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} />
              <input type="email" placeholder="Email" className="w-full p-2 border rounded"
                value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <input type="tel" placeholder="Phone Number" className="w-full p-2 border rounded"
                value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              
              {/* ✅ Resume Field */}
              <textarea placeholder="Paste your resume here..." className="w-full p-2 border rounded resize-none h-40"
                value={profile.resume} onChange={(e) => setProfile({ ...profile, resume: e.target.value })} />

              {/* ✅ Unique Traits */}
              <h3 className="text-lg font-medium text-gray-700">Three Unique Things About You</h3>
              {profile.uniqueTraits.map((trait, index) => (
                <input key={index} type="text" placeholder={`Unique trait ${index + 1}`}
                  className="w-full p-2 border rounded"
                  value={trait}
                  onChange={(e) => {
                    const updatedTraits = [...profile.uniqueTraits];
                    updatedTraits[index] = e.target.value;
                    setProfile({ ...profile, uniqueTraits: updatedTraits });
                  }} />
              ))}

              <button onClick={handleSaveProfile} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save Profile
              </button>
            </div>
          </div>

          {/* Cover Letter Generator */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Cover Letter Generator
            </h2>
            <div className="space-y-4">
              <textarea placeholder="Paste job description here..." className="w-full h-48 p-2 border rounded resize-none"
                value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />

              {/* ✅ Two New Buttons for Cover Letter Generation */}
              <button onClick={() => handleGenerateCoverLetter('chronological')} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Generate Chronological Cover Letter
              </button>
              <button onClick={() => handleGenerateCoverLetter('short')} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-2">
                Generate Short Cover Letter
              </button>

              {coverLetter && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Generated Cover Letter:</h3>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {coverLetter}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
