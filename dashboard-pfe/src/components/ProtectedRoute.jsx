import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem('token')

  // =========================
  // PAS CONNECTE
  // =========================

  if (!token) {

    return <Navigate to="/login" />
  }

  // =========================
  // CONNECTE
  // =========================

  return children
}