import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import IntroScreen from "./IntroScreen";
import LoginScreen from "./Login";
import DashDev from "./DashDev";
import BacklogManager from "./BacklogManager";
import AnalyticsManager from "./Analytics";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroWrapper />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/dashdev" element={<DashDev />} />
      <Route path="/backlogMan" element={<BacklogManager />} />
      <Route path="/analytics" element={<AnalyticsManager />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Este componente envuelve IntroScreen para poder usar navegación
function IntroWrapper() {
  const navigate = useNavigate();

  return (
    <IntroScreen onContinue={() => navigate("/login")} />
  );
}

export default App;
