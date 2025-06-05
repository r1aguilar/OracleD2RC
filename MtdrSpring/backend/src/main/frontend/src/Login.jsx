import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear error message when user changes inputs
  useEffect(() => {
    if (errorMsg) {
      setErrorMsg("");
    }
  }, [emailOrPhone, password]);

  const handleLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);

    const isEmail = emailOrPhone.includes("@");
    let endpoint = "/auth/login";
    let loginPayload = {
      password,
    };

    if (isEmail) {
      loginPayload.correo = emailOrPhone;
    } else {
      // Clean phone input
      const cleanedPhone = emailOrPhone.replace(/[+\-\s]/g, "");
      endpoint = "/auth/login/Telefono";
      loginPayload.telefono = cleanedPhone;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(loginPayload)
      });

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
      console.error("💥 Error en login:", error);
      setErrorMsg(error.message || "Error de autenticación");
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

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-black/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">LOGIN TO YOUR ACCOUNT</h2>
        <p className="text-gray-400 text-sm text-center mb-4 sm:mb-6">Enter your email or phone and password</p>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Email"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <Mail className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <Lock className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-2 rounded-md font-semibold transition text-sm sm:text-base flex items-center justify-center ${
              isLoading
                ? "bg-blue-800 cursor-not-allowed"
                : "bg-red-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                LOGGING IN...
              </>
            ) : (
              "LOGIN"
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-red-500 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginScreen;