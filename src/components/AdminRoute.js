import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Si no ha iniciado sesión
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si no es administrador
  if (usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
