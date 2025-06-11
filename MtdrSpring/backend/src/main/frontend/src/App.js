import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import IntroScreen from "./IntroScreen";
import LoginScreen from "./Login";
import DashDev from "./DashDev";
import BacklogManager from "./BacklogManager";
import AnalyticsManager from "./Analytics";
import AnalyticsSprint from "./Analyticsbysprint";
import DashManager from "./DashManager";
import BacklogDeveloper from "./BacklogDeveloper";
import Register from "./Register";
import ProfileManager from "./ProfileManager";
import ProfileDev from "./ProfileDev";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroWrapper />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashdev" element={<DashDev />} />
      <Route path="/dashmanager" element={<DashManager />} />
      <Route path="/backlogMan" element={<BacklogManager />} />
      <Route path="/backlogDev" element={<BacklogDeveloper />} />
      <Route path="/analytics" element={<AnalyticsManager />} />
      <Route path="/analyticssprint" element={<AnalyticsSprint />} />
      <Route path="/profileManager" element={<ProfileManager/>} />
      <Route path="/profileDev" element={<ProfileDev />} />
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