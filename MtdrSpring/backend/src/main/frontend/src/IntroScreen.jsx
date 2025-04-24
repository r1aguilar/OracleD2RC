import React from "react";
import { motion } from "framer-motion";
import logo from "./Assets/tasko.png";

const IntroScreen = ({ onContinue }) => {
      return (
        <motion.div
          className="h-screen flex items-center justify-center bg-black relative px-4 sm:px-6 md:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Logo en lugar de texto */}
          <motion.img
            src={logo}
            alt="Logo"
            className="w-40 sm:w-52 md:w-64 lg:w-72 z-10 h-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
    
          {/* Simula transición */}
          <motion.div
            className="absolute bottom-10 text-white cursor-pointer z-10 text-sm sm:text-base"
            onClick={onContinue}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="opacity-70">Tap to continue</p>
          </motion.div>
        </motion.div>
      );
    };
    
    export default IntroScreen;
    