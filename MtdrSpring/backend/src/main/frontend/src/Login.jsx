import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
  
    const isEmail = emailOrPhone.includes("@");
  
    let passwordToSend;
    if (password === "admin") {
      passwordToSend = "$2a$12$94Fmc41Em5pPymRMfk.wjObvXttvu/aDE/4aGl4SQ8ZCOGWzL6h3G";
    } else if (password === "123") {
      passwordToSend = "$2a$12$E7.M6ukX3OAN3f1WixuGru6RGoHr.QI5mAZ77Uyjs3bYOjLD5VFLG";
    } else {
      passwordToSend = password;
    }
  
    try {
      const response = await fetch("http://220.158.67.50/pruebasUser/login/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          correo: emailOrPhone,
          password: passwordToSend
        })
      });
  
      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Respuesta vacía del servidor");
      }
      const data = JSON.parse(text);
      
      console.log("📦 JSON recibido:", data);
      
      if (!data.id_usuario || typeof data.manager === "undefined") {
        throw new Error("Datos incompletos del servidor");
      }
      
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userData", JSON.stringify(data));
      localStorage.setItem("isManager", data.manager);
      
      navigate(data.manager ? "/analytics" : "/dashdev");
  
    } catch (error) {
      console.error("💥 Error en login:", error);
      setErrorMsg(error.message);
    }
  };
  

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-black/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">LOGIN TO YOUR ACCOUNT</h2>
        <p className="text-gray-400 text-sm text-center mb-4 sm:mb-6">Enter your email or phone and password</p>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Email or Phone Number"
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

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <button className="text-blue-500 hover:underline">Forgot password?</button>
          </div>

          <button onClick={handleLogin}
            className="w-full py-2 bg-red-600 rounded-md font-semibold hover:bg-blue-700 transition text-sm sm:text-base">
            LOGIN
          </button>
        </div>

        <div className="my-4 text-center text-gray-500 text-sm">Or continue with</div>

        <div className="flex justify-center">
          <button className="flex items-center justify-center bg-white text-black rounded-md py-2 px-4 hover:opacity-90 transition text-sm sm:text-base">
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <a href="/registro" className="text-red-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginScreen;