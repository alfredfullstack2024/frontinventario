import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Categorias from "./pages/Categorias";
import GenerarEtiquetas from "./pages/GenerarEtiquetas";
import CodigosDisponibles from "./pages/CodigosDisponibles";
import AsignarProductos from "./pages/AsignarProductos";
import Inventario from "./pages/Inventario";
import EstadisticasAvanzadas from "./pages/EstadisticasAvanzadas";
import Productos from "./pages/Productos"; // Mantener por compatibilidad
import Movimientos from "./pages/Movimientos";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Usuarios from "./pages/Usuarios";

export default function App() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const cerrarSesion = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("usuario");

    window.location.href = "/login";
  };
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            📦 Sistema Inventario
          </Link>

          <div className="navbar-nav me-auto">
            <Link className="nav-link" to="/">
              🏠 Dashboard
            </Link>
            <Link className="nav-link" to="/generar-etiquetas">
              🏷️ Generar Etiquetas
            </Link>
            <Link className="nav-link" to="/codigos-disponibles">
              📋 Ver Códigos
            </Link>
            <Link className="nav-link" to="/asignar-productos">
              📱 Asignar Productos
            </Link>
            <Link className="nav-link" to="/categorias">
              📁 Categorías
            </Link>
            <Link className="nav-link" to="/inventario">
              📊 Inventario
            </Link>
            <Link className="nav-link" to="/reporte">
              📈 Estadísticas
            </Link>
            <Link className="nav-link" to="/movimientos">
              📜 Movimientos
            </Link>
            {usuario?.rol === "admin" && (
              <Link className="nav-link" to="/usuarios">
                👥 Usuarios
              </Link>
            )}
          </div>

          <div className="d-flex align-items-center gap-3">
            {usuario && (
              <>
                <span className="text-light">👤 {usuario.nombre}</span>

                <span className="badge bg-warning text-dark">
                  {usuario.rol.toUpperCase()}
                </span>
              </>
            )}
            <button
              onClick={cerrarSesion}
              className="btn btn-outline-light btn-sm"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="min-vh-100 bg-light">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <Categorias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generar-etiquetas"
            element={
              <ProtectedRoute>
                <GenerarEtiquetas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/codigos-disponibles"
            element={
              <ProtectedRoute>
                <CodigosDisponibles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asignar-productos"
            element={
              <ProtectedRoute>
                <AsignarProductos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventario"
            element={
              <ProtectedRoute>
                <Inventario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reporte"
            element={
              <ProtectedRoute>
                <EstadisticasAvanzadas />
              </ProtectedRoute>
            }
          />

          {/* Rutas legacy para compatibilidad */}
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <Productos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/movimientos"
            element={
              <ProtectedRoute>
                <Movimientos />
              </ProtectedRoute>
            }
          />
          <Route
  path="/usuarios"
  element={
    <AdminRoute>
      <Usuarios />
    </AdminRoute>
  }
/>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light text-center py-3 mt-5">
        <div className="container">
          <small>
            📦 Sistema de Inventario con Códigos de Barras |
            <span className="text-muted"> Desarrollado con ❤️</span>
          </small>
        </div>
      </footer>
    </Router>
  );
}
