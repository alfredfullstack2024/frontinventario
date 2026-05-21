import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function EstadisticasAvanzadas() {
  const [datos, setDatos] = useState({
    estadisticasGenerales: { disponibles: 0, asignados: 0, total: 0 },
    productosPorCategoria: [],
    rangoPrecios: { minimo: 0, maximo: 0, promedio: 0 },
    ubicaciones: [],
    productosRecientes: [],
    valorInventario: 0,
  });
  const [filtros, setFiltros] = useState({
    categoria: "",
    ubicacion: "",
    precioMinimo: "",
    precioMaximo: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  cargarDatos();
  cargarCategorias();
}, [cargarDatos]);

  const cargarCategorias = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar estadísticas generales
      const statsRes = await axios.get(
        "http://localhost:4000/api/codigos/stats"
      );[filtros]);

      // Cargar códigos asignados para análisis detallado
      const codigosRes = await axios.get(
        "http://localhost:4000/api/codigos?estado=asignado&limit=1000"
      );
      const codigosAsignados = codigosRes.data;

      // Procesar datos
      const estadisticas = procesarEstadisticas(codigosAsignados);

      setDatos({
        estadisticasGenerales: statsRes.data,
        ...estadisticas,
      });
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const procesarEstadisticas = (codigos) => {
    const codigosFiltrados = aplicarFiltros(codigos);

    // Productos por categoría
    const categoriaStats = {};
    codigosFiltrados.forEach((codigo) => {
      if (codigo.producto.categoria) {
        const catNombre = codigo.producto.categoria.nombre || "Sin categoría";
        if (!categoriaStats[catNombre]) {
          categoriaStats[catNombre] = { count: 0, valor: 0 };
        }
        categoriaStats[catNombre].count++;
        categoriaStats[catNombre].valor += codigo.producto.precio || 0;
      }
    });

    const productosPorCategoria = Object.entries(categoriaStats).map(
      ([nombre, data]) => ({
        nombre,
        cantidad: data.count,
        valorTotal: data.valor,
      })
    );

    // Análisis de precios
    const precios = codigosFiltrados
      .map((c) => c.producto.precio)
      .filter((p) => p && p > 0);

    const rangoPrecios = {
      minimo: precios.length ? Math.min(...precios) : 0,
      maximo: precios.length ? Math.max(...precios) : 0,
      promedio: precios.length
        ? precios.reduce((a, b) => a + b, 0) / precios.length
        : 0,
    };

    // Análisis por ubicaciones
    const ubicacionStats = {};
    codigosFiltrados.forEach((codigo) => {
      const ubicacion = codigo.producto.ubicacion || "Sin ubicación";
      if (!ubicacionStats[ubicacion]) {
        ubicacionStats[ubicacion] = { count: 0, valor: 0 };
      }
      ubicacionStats[ubicacion].count++;
      ubicacionStats[ubicacion].valor += codigo.producto.precio || 0;
    });

    const ubicaciones = Object.entries(ubicacionStats).map(
      ([nombre, data]) => ({
        nombre,
        cantidad: data.count,
        valorTotal: data.valor,
      })
    );

    // Productos recientes (últimos 10 asignados)
    const productosRecientes = codigosFiltrados
      .filter((c) => c.fechaAsignacion)
      .sort((a, b) => new Date(b.fechaAsignacion) - new Date(a.fechaAsignacion))
      .slice(0, 10);

    // Valor total del inventario
    const valorInventario = codigosFiltrados.reduce((total, codigo) => {
      return (
        total + (codigo.producto.precio || 0) * (codigo.producto.stock || 1)
      );
    }, 0);

    return {
      productosPorCategoria,
      rangoPrecios,
      ubicaciones,
      productosRecientes,
      valorInventario,
    };
  };

  const aplicarFiltros = (codigos) => {
    return codigos.filter((codigo) => {
      if (!codigo.producto) return false;

      // Filtro por categoría
      if (
        filtros.categoria &&
        codigo.producto.categoria?._id !== filtros.categoria
      ) {
        return false;
      }

      // Filtro por ubicación
      if (
        filtros.ubicacion &&
        !codigo.producto.ubicacion
          ?.toLowerCase()
          .includes(filtros.ubicacion.toLowerCase())
      ) {
        return false;
      }

      // Filtro por precio mínimo
      if (
        filtros.precioMinimo &&
        (codigo.producto.precio || 0) < parseFloat(filtros.precioMinimo)
      ) {
        return false;
      }

      // Filtro por precio máximo
      if (
        filtros.precioMaximo &&
        (codigo.producto.precio || 0) > parseFloat(filtros.precioMaximo)
      ) {
        return false;
      }

      // Filtro por fecha desde
      if (
        filtros.fechaDesde &&
        new Date(codigo.fechaAsignacion) < new Date(filtros.fechaDesde)
      ) {
        return false;
      }

      // Filtro por fecha hasta
      if (
        filtros.fechaHasta &&
        new Date(codigo.fechaAsignacion) > new Date(filtros.fechaHasta)
      ) {
        return false;
      }

      return true;
    });
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros2 = () => {
    cargarDatos(); // Recargar con filtros aplicados
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: "",
      ubicacion: "",
      precioMinimo: "",
      precioMaximo: "",
      fechaDesde: "",
      fechaHasta: "",
    });
    setTimeout(cargarDatos, 100); // Recargar sin filtros
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-5 mb-3">Estadísticas Avanzadas</h1>
          <p className="text-muted">
            Análisis detallado de tu inventario con filtros personalizados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">Filtros de Análisis</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Categoría:</label>
              <select
                className="form-control"
                value={filtros.categoria}
                onChange={(e) =>
                  handleFiltroChange("categoria", e.target.value)
                }
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Ubicación:</label>
              <input
                type="text"
                className="form-control"
                value={filtros.ubicacion}
                onChange={(e) =>
                  handleFiltroChange("ubicacion", e.target.value)
                }
                placeholder="Buscar ubicación..."
              />
            </div>
            <div className="col-md-2 mb-3">
              <label className="form-label">Precio mín:</label>
              <input
                type="number"
                className="form-control"
                value={filtros.precioMinimo}
                onChange={(e) =>
                  handleFiltroChange("precioMinimo", e.target.value)
                }
                placeholder="0"
              />
            </div>
            <div className="col-md-2 mb-3">
              <label className="form-label">Precio máx:</label>
              <input
                type="number"
                className="form-control"
                value={filtros.precioMaximo}
                onChange={(e) =>
                  handleFiltroChange("precioMaximo", e.target.value)
                }
                placeholder="999999"
              />
            </div>
            <div className="col-md-2 mb-3">
              <label className="form-label">Acciones:</label>
              <div className="d-grid gap-2">
                <button
                  onClick={aplicarFiltros2}
                  className="btn btn-primary btn-sm"
                >
                  Aplicar
                </button>
                <button
                  onClick={limpiarFiltros}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center h-100 border-primary">
            <div className="card-body">
              <h2 className="text-primary">
                {datos.estadisticasGenerales.total}
              </h2>
              <p className="card-text">Total Códigos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100 border-success">
            <div className="card-body">
              <h2 className="text-success">
                {datos.estadisticasGenerales.asignados}
              </h2>
              <p className="card-text">Productos Registrados</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100 border-warning">
            <div className="card-body">
              <h2 className="text-warning">
                {datos.estadisticasGenerales.disponibles}
              </h2>
              <p className="card-text">Códigos Disponibles</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100 border-info">
            <div className="card-body">
              <h2 className="text-info">${datos.valorInventario.toFixed(2)}</h2>
              <p className="card-text">Valor Total Inventario</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Productos por Categoría */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Productos por Categoría</h5>
            </div>
            <div className="card-body">
              {datos.productosPorCategoria.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.productosPorCategoria.map((cat, idx) => (
                        <tr key={idx}>
                          <td>{cat.nombre}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">
                              {cat.cantidad}
                            </span>
                          </td>
                          <td className="text-end">
                            ${cat.valorTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">
                  No hay datos disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Análisis de Precios */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Análisis de Precios</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <h4 className="text-success">
                    ${datos.rangoPrecios.minimo.toFixed(2)}
                  </h4>
                  <small className="text-muted">Precio Mínimo</small>
                </div>
                <div className="col-4">
                  <h4 className="text-primary">
                    ${datos.rangoPrecios.promedio.toFixed(2)}
                  </h4>
                  <small className="text-muted">Precio Promedio</small>
                </div>
                <div className="col-4">
                  <h4 className="text-danger">
                    ${datos.rangoPrecios.maximo.toFixed(2)}
                  </h4>
                  <small className="text-muted">Precio Máximo</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos por Ubicación */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Productos por Ubicación</h5>
            </div>
            <div className="card-body">
              {datos.ubicaciones.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Ubicación</th>
                        <th className="text-center">Productos</th>
                        <th className="text-end">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.ubicaciones.slice(0, 8).map((ub, idx) => (
                        <tr key={idx}>
                          <td>{ub.nombre}</td>
                          <td className="text-center">
                            <span className="badge bg-success">
                              {ub.cantidad}
                            </span>
                          </td>
                          <td className="text-end">
                            ${ub.valorTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">
                  No hay ubicaciones registradas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Productos Recientes */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Últimos Productos Registrados</h5>
            </div>
            <div className="card-body">
              {datos.productosRecientes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-end">Precio</th>
                        <th className="text-end">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.productosRecientes.map((codigo, idx) => (
                        <tr key={idx}>
                          <td>
                            <small>{codigo.producto.nombre}</small>
                          </td>
                          <td className="text-end">
                            ${codigo.producto.precio?.toFixed(2) || "0.00"}
                          </td>
                          <td className="text-end">
                            <small>
                              {new Date(
                                codigo.fechaAsignacion
                              ).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">
                  No hay productos recientes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
