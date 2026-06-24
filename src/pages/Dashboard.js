import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logoInventario from "./mar_cas.jpeg";

export default function Dashboard() {
  const [stats, setStats] = useState({
    disponibles: 0,
    asignados: 0,
    total: 0,
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [statsRes, categoriasRes] = await Promise.all([
        axios.get("https://backinventario-wns5.onrender.com/api/codigos/stats"),
        axios.get("https://backinventario-wns5.onrender.com/api/categorias"),
      ]);

      setStats(statsRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12 text-center">
    <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
  <div
    className="bg-primary rounded p-2"
    style={{
      width: "95px",
      height: "95px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <img
      src={logoInventario}
      alt="Logo Inventario"
      style={{
        width: "120px",
        height: "120px",
        objectFit: "contain",
      }}
    />
  </div>

  <h1 className="display-4 mb-0">
    Sistema de Inventario
  </h1>
</div>      
    
    <p className="lead text-muted">
            Gestiona tu inventario con códigos de barras de manera profesional
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row mb-5">
        <div className="col-md-4">
          <div className="card text-center h-100 border-success">
            <div className="card-body">
              <div className="display-4 text-success mb-3">📊</div>
              <h5 className="card-title">Total Códigos</h5>
              <h2 className="text-success">{stats.total}</h2>
              <p className="text-muted">Códigos generados</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100 border-warning">
            <div className="card-body">
              <div className="display-4 text-warning mb-3">🏷️</div>
              <h5 className="card-title">Disponibles</h5>
              <h2 className="text-warning">{stats.disponibles}</h2>
              <p className="text-muted">Sin asignar</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100 border-primary">
            <div className="card-body">
              <div className="display-4 text-primary mb-3">✅</div>
              <h5 className="card-title">Asignados</h5>
              <h2 className="text-primary">{stats.asignados}</h2>
              <p className="text-muted">Con productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4 text-center">🚀 Acciones Rápidas</h3>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <Link to="/generar-etiquetas" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body text-center">
                <div className="display-1 mb-3">🏷️</div>
                <h5 className="card-title">Generar Etiquetas</h5>
                <p className="card-text text-muted">
                  Crea códigos de barras en lotes para imprimir
                </p>
                <span className="btn btn-outline-primary">Generar →</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <Link to="/asignar-productos" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body text-center">
                <div className="display-1 mb-3">📱</div>
                <h5 className="card-title">Asignar Productos</h5>
                <p className="card-text text-muted">
                  Escanea códigos y asigna información
                </p>
                <span className="btn btn-outline-success">Escanear →</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <Link to="/categorias" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body text-center">
                <div className="display-1 mb-3">📁</div>
                <h5 className="card-title">Categorías</h5>
                <p className="card-text text-muted">
                  Administra las categorías de productos
                </p>
                <span className="btn btn-outline-info">Gestionar →</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <Link to="/inventario" className="text-decoration-none">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body text-center">
                <div className="display-1 mb-3">📋</div>
                <h5 className="card-title">Ver Inventario</h5>
                <p className="card-text text-muted">
                  Consulta todos los productos registrados
                </p>
                <span className="btn btn-outline-warning">Ver →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Información de Categorías */}
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                📁 Categorías Disponibles ({categorias.length})
              </h5>
            </div>
            <div className="card-body">
              {categorias.length > 0 ? (
                <div className="row">
                  {categorias.map((categoria) => (
                    <div key={categoria._id} className="col-md-4 mb-2">
                      <span className="badge bg-light text-dark p-2 w-100">
                        📂 {categoria.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>No hay categorías creadas aún</p>
                  <Link to="/categorias" className="btn btn-primary">
                    Crear Primera Categoría
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer con instrucciones */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="alert alert-light border">
            <h5>💡 ¿Cómo usar el sistema?</h5>
            <ol>
              <li>
                <strong>Crea categorías</strong> para organizar tus productos
              </li>
              <li>
                <strong>Genera etiquetas</strong> vacías e imprime los códigos
                de barras
              </li>
              <li>
                <strong>Pega las etiquetas</strong> en tus productos físicos
              </li>
              <li>
                <strong>Escanea y asigna</strong> la información de cada
                producto
              </li>
              <li>
                <strong>Consulta tu inventario</strong> cuando necesites
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
