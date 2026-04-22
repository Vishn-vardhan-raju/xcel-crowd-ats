import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CandidatePortal from './CandidatePortal';
import RecruiterDashboard from './RecruiterDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect base URL to candidate portal */}
        <Route path="/" element={<Navigate to="/candidate" />} />
        
        {/* Different Links for Different Roles */}
        <Route path="/candidate" element={<CandidatePortal />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;