import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const access = localStorage.getItem("access");
  const role = localStorage.getItem("role");
  
  // Also try to read from the JSON user object to be extremely robust
  let userRole = role;
  if (!userRole) {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userRole = user.role;
      } catch (e) {
        console.error("Failed to parse user role:", e);
      }
    }
  }

  // Redirect to login if not authenticated
  if (!access) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect authenticated users to their correct dashboard
    if (userRole === "student") {
      return <Navigate to="/student" replace />;
    } else if (userRole === "vendor") {
      return <Navigate to="/vendor-dashboard" replace />;
    } else if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      // Force logout and login if role is invalid
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
