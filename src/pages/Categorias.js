import { useEffect, useState } from "react";
import axios from "axios";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://backinventario-wns5.onrender.com/api/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      alert("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("El nombre de la categoría es obligatorio");
      return;
    }

    setCreando(true);
    try {
      await axios.post("https://backinventario-wns5.onrender.com/api/categorias", {
        nombre: nombre.trim(),
      });
      setNombre("");
      cargar();
      alert(`✅ Categoría "${nombre}" creada exitosamente`);
    } catch (error) {
      console.error("Error creando categoría:", error);
      if (error.response?.status === 400) {
        alert("Esta categoría ya existe");
      } else {
        alert("Error al crear la categoría");
      }
    } finally {
      setCreando(false);
    }
  };

  const eliminar = async (id, nombreCategoria) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la categoría "${nombreCategoria}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`https://backinventario-wns5.onrender.com/api/categorias/${id}`);
      cargar();
      alert(`✅ Categoría "${nombreCategoria}" eliminada correctamente`);
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      alert("Error al eliminar la categoría");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando categorías...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h2 className="mb-0">📁 Gestión de Categorías</h2>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                Administra las categorías para organizar tus productos de manera
                eficiente
              </p>

              {/* Formulario para crear categoría */}
              <div className="card mb-4 border-primary">
                <div className="card-header bg-light">
                  <h5 className="mb-0">➕ Crear Nueva Categoría</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={crear}>
                    <div className="row align-items-end">
                      <div className="col-md-8">
                        <label className="form-label fw-bold">
                          Nombre de la categoría:
                        </label>
                        <input
                          className="form-control form-control-lg"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Ej: Electrónicos, Ropa, Hogar..."
                          maxLength={50}
                          required
                        />
                        <div className="form-text">
                          {nombre.length}/50 caracteres
                        </div>
                      </div>
                      <div className="col-md-4">
                        <button
                          type="submit"
                          disabled={creando || !nombre.trim()}
                          className="btn btn-success btn-lg w-100"
                        >
                          {creando ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Creando...
                            </>
                          ) : (
                            "Crear Categoría"
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Lista de categorías */}
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">
                    📋 Categorías Existentes ({categorias.length})
                  </h5>
                </div>
                <div className="card-body">
                  {categorias.length > 0 ? (
                    <div className="row">
                      {categorias.map((categoria) => (
                        <div
                          key={categoria._id}
                          className="col-md-6 col-lg-4 mb-3"
                        >
                          <div className="card h-100 border-secondary">
                            <div className="card-body text-center">
                              <div className="display-4 mb-3">📂</div>
                              <h6 className="card-title fw-bold">
                                {categoria.nombre}
                              </h6>
                              <div className="mt-3">
                                <button
                                  onClick={() =>
                                    eliminar(categoria._id, categoria.nombre)
                                  }
                                  className="btn btn-outline-danger btn-sm"
                                  title={`Eliminar ${categoria.nombre}`}
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <div className="display-1 mb-3">📁</div>
                      <h4>No hay categorías creadas</h4>
                      <p>
                        Crea tu primera categoría usando el formulario de arriba
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              {categorias.length > 0 && (
                <div className="alert alert-info mt-4">
                  <h6 className="fw-bold">💡 Información útil:</h6>
                  <ul className="mb-0 small">
                    <li>
                      Las categorías te ayudan a organizar mejor tu inventario
                    </li>
                    <li>
                      Puedes asignar productos a categorías al escanear códigos
                    </li>
                    <li>Las estadísticas se pueden filtrar por categoría</li>
                    <li>
                      <strong>Cuidado:</strong> Al eliminar una categoría, los
                      productos asignados quedarán sin categoría
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
