import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, User, UserCircle, Loader } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    correo: "",
    telefono: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (errorMsg) {
      setErrorMsg("");
    }
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentFormattedDate = () => {
    const now = new Date();
    return now.toISOString().replace(".000Z", "Z-06:00");
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const cleanedPhone = formData.telefono.replace(/[+\-\s]/g, "");
    const payload = {
      ...formData,
      telefono: cleanedPhone,
      fechaCreacion: getCurrentFormattedDate(),
      manager: false,
      deleted: false
    };

    try {
      // Step 1: Register user
      const response = await fetch("auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error creating user");
      }

      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Respuesta vacía del servidor");
      }

      const data = JSON.parse(text);
      console.log("📦 JSON recibido:", data);

      if (!data.user.id || typeof data.user.manager === "undefined") {
        throw new Error("Datos incompletos del servidor");
      }

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userData", JSON.stringify(data.user));
      localStorage.setItem("isManager", data.user.manager);
      localStorage.setItem("token", data.token);

      navigate(data.user.manager ? "/dashmanager" : "/dashdev");
    } catch (error) {
      console.error("❌ Error during registration/login:", error);
      setErrorMsg(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorPopup = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg"
    >
      {message}
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white px-4 sm:px-6 md:px-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <AnimatePresence>
        {errorMsg && <ErrorPopup message={errorMsg} />}
      </AnimatePresence>

      <div className="w-full max-w-md bg-black/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">CREATE AN ACCOUNT</h2>

        <div className="space-y-4">
          {/* Username */}
          <div className="relative">
            <input
              type="text"
              name="usuario"
              placeholder="Username"
              value={formData.usuario}
              onChange={handleChange}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <User className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          {/* Full Name */}
          <div className="relative">
            <input
              type="text"
              name="nombre"
              placeholder="Full Name"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <UserCircle className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="correo"
              placeholder="Email"
              value={formData.correo}
              onChange={handleChange}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Mail className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          {/* Phone */}
          <div className="relative">
            <input
              type="tel"
              name="telefono"
              placeholder="Phone Number (e.g., +52 1234567890)"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Phone className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Lock className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`w-full py-2 rounded-md font-semibold transition flex items-center justify-center ${
              isLoading ? "bg-blue-800 cursor-not-allowed" : "bg-red-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                REGISTERING...
              </>
            ) : (
              "REGISTER"
            )}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-red-500 hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;