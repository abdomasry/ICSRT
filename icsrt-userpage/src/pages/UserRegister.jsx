import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import CountrySelect from "../components/CountrySelect";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { api } from "../lib/api";

const UserRegister = () => {
  const navigate = useNavigate();
  useUser();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: { code: "", number: "", full: "" },
    institution: "",
    country: "",
    conference: "",
    researchArea: "",
    registrationType: "",
    paperTitle: "",
    abstract: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // const [conferences, setConferences] = useState([]);

  // useEffect(() => {
  //   // Fetch available conferences
  //   fetch("http://localhost:3000/api/conferences")
  //     .then((res) => res.json())
  //     .then(setConferences)
  //     .catch(() => {});
  // }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (phoneData) => {
    setForm({ ...form, phone: phoneData });
  };

  const handleCountryChange = (country) => {
    setForm({ ...form, country: country });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    try {
      const registrationData = {
        ...form,
        phone: form.phone.full || `${form.phone.code}${form.phone.number}`, // Ensure we send the full phone number
        registeredAt: new Date().toISOString(),
        status: "pending",
        paymentStatus: "pending"
      };

  const data = await api.post("/api/registrations", registrationData);
  if (data && (data.success !== false)) {
        setMessage("Registration submitted successfully! We will contact you soon.");
        setForm({
          fullName: "",
          email: "",
          phone: { code: "", number: "", full: "" },
          institution: "",
          country: "",
          conference: "",
          researchArea: "",
          registrationType: "",
          paperTitle: "",
          abstract: ""
        });
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setError(data?.error || "Failed to submit registration");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-blue-800 mb-4">Conference Registration</h1>
            <p className="text-xl text-gray-600">
              Register for ICSRT Conference - International Conference on Sustainable Research & Technology
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
            </div>
            
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            
            <PhoneNumberInput
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="Phone Number *"
              required
              name="phone"
              id="phone"
              className=""
            />
            
            <input
              type="text"
              name="institution"
              placeholder="Institution/University"
              value={form.institution}
              onChange={handleChange}
              className="w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            
            <div>
              <CountrySelect
                value={form.country}
                onChange={handleCountryChange}
                name="country"
                id="country"
                required
                className="w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* Conference Information */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Conference Details
              </h3>
            </div>
            
            <select
              name="conference"
              value={form.conference}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="">Select Conference *</option>
              <option value="ICSRT 2025">ICSRT 2025 - International Conference on Sustainable Research & Technology</option>
              <option value="Middle East Conference on Artificial Intelligence">Middle East Conference on Artificial Intelligence</option>
              <option value="Global Innovation Summit">Global Innovation Summit</option>
              <option value="Tech for Future Conference">Tech for Future Conference</option>
            </select>
            
            <select
              name="registrationType"
              value={form.registrationType}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="">Registration Type *</option>
              <option value="Student">Student</option>
              <option value="Academic">Academic/Faculty</option>
              <option value="Professional">Professional/Industry</option>
              <option value="Researcher">Researcher</option>
            </select>
            
            <input
              type="text"
              name="researchArea"
              placeholder="Research Area/Field of Interest *"
              value={form.researchArea}
              onChange={handleChange}
              required
              className="md:col-span-2 w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            
            <input
              type="text"
              name="paperTitle"
              placeholder="Paper Title (if presenting)"
              value={form.paperTitle}
              onChange={handleChange}
              className="md:col-span-2 w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            
            <textarea
              name="abstract"
              placeholder="Abstract (if presenting a paper - max 300 words)"
              value={form.abstract}
              onChange={handleChange}
              rows="4"
              className="md:col-span-2 w-full border border-blue-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <div className="md:col-span-2 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Conference organizers will review your registration within 48 hours</li>
                  <li>• You'll receive confirmation email with payment details</li>
                  <li>• Registration packet will be sent upon payment confirmation</li>
                  <li>• Updates about the conference schedule and venue</li>
                </ul>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Submit Registration
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-xl">
              <div className="text-green-800 font-semibold text-center">{message}</div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl">
              <div className="text-red-800 font-semibold text-center">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
