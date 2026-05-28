
import { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#0d6efd",
  "#198754",
  "#ffc107",
  "#dc3545",
  "#6f42c1",
  "#20c997",
];

export default function EstadisticasAvanzadas() {
  const [datos, setDatos] = useState({
    estadisticasGenerales: { disponibles: 0, asignados: 0, total: 0 },
    productosPorCategoria: [],
    rangoPrecios: { minimo: 0, maximo: 0, promedio: 0 },
    ubicaciones: [],
    productosRecientes: [],
    valorInventario: 0,
    productosCriticos: [],
    proximosVencer: [],
  });

  const [, setCategorias] = useState([]);

  const [filtros] = useState({
    categoria: "",
    ubicacion: "",
    precioMinimo: "",
    precioMaximo: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  cargarDatos();
  cargarCategorias();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const cargarCategorias = async () => {
    try {
      const res = await axios.get(
        "https://backinventario-wns5.onrender.com/api/categorias"
      );

      setCategorias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const statsRes = await axios.get(
        "https://backinventario-wns5.onrender.com/api/codigos/stats"
      );

      const codigosRes = await axios.get(
        "https://backinventario-wns5.onrender.com/api/codigos?estado=asignado&limit=1000"
      );

      const estadisticas = procesarEstadisticas(codigosRes.data);

      setDatos({
        estadisticasGenerales: statsRes.data,
        ...estadisticas,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (codigos) => {
    return codigos.filter((codigo) => {
      if (!codigo.producto) return false;

      if (
        filtros.categoria &&
        codigo.producto.categoria?._id !== filtros.categoria
      ) {
        return false;
      }

      if (
        filtros.ubicacion &&
        !codigo.producto.ubicacion
          ?.toLowerCase()
          .includes(filtros.ubicacion.toLowerCase())
      ) {
        return false;
      }

      if (
        filtros.precioMinimo &&
        (codigo.producto.precio || 0) < parseFloat(filtros.precioMinimo)
      ) {
        return false;
      }

      if (
        filtros.precioMaximo &&
        (codigo.producto.precio || 0) > parseFloat(filtros.precioMaximo)
      ) {
        return false;
      }

      return true;
    });
  };

  const procesarEstadisticas = (codigos) => {
    const filtrados = aplicarFiltros(codigos);

    const categoriaStats = {};
    const ubicacionStats = {};

    let productosCriticos = [];
    let proximosVencer = [];

    filtrados.forEach((codigo) => {
      const producto = codigo.producto;

      // Categorías
      const categoria =
        producto.categoria?.nombre || "Sin categoría";

      if (!categoriaStats[categoria]) {
        categoriaStats[categoria] = 0;
      }

      categoriaStats[categoria]++;

      // Ubicaciones
      const ubicacion =
        producto.ubicacion || "Sin ubicación";

      if (!ubicacionStats[ubicacion]) {
        ubicacionStats[ubicacion] = 0;
      }

      ubicacionStats[ubicacion]++;

      // STOCK CRÍTICO
      if (
        producto.stock <=
        (producto.cantidadMinimaMensual || 5)
      ) {
        productosCriticos.push(codigo);
      }

      // VENCIMIENTOS
      if (producto.fechaVencimiento) {
        const hoy = new Date();
        const vence = new Date(producto.fechaVencimiento);

        const diferencia =
          (vence - hoy) / (1000 * 60 * 60 * 24);

        if (diferencia <= 180) {
          proximosVencer.push({
            ...codigo,
            diasRestantes: Math.floor(diferencia),
          });
        }
      }
    });

    const productosPorCategoria = Object.entries(
      categoriaStats
    ).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }));

    const ubicaciones = Object.entries(ubicacionStats).map(
      ([nombre, cantidad]) => ({
        nombre,
        cantidad,
      })
    );

    const precios = filtrados
      .map((c) => c.producto.precio || 0)
      .filter((p) => p > 0);

    const rangoPrecios = {
      minimo: precios.length ? Math.min(...precios) : 0,
      maximo: precios.length ? Math.max(...precios) : 0,
      promedio: precios.length
        ? precios.reduce((a, b) => a + b, 0) / precios.length
        : 0,
    };

    const valorInventario = filtrados.reduce((acc, c) => {
      return (
        acc +
        (c.producto.precio || 0) *
          (c.producto.stock || 1)
      );
    }, 0);

    return {
      productosPorCategoria,
      ubicaciones,
      rangoPrecios,
      valorInventario,
      productosCriticos,
      proximosVencer,
      productosRecientes: filtrados.slice(0, 10),
    };
  };

  const badgeEstado = (producto) => {
    if (producto.stock <= 3) {
      return (
        <span className="badge bg-danger">
          🔴 Stock crítico
        </span>
      );
    }

    if (producto.fechaVencimiento) {
      const hoy = new Date();
      const vence = new Date(producto.fechaVencimiento);

      const dias =
        (vence - hoy) / (1000 * 60 * 60 * 24);

      if (dias <= 180) {
        return (
          <span className="badge bg-warning text-dark">
            🟡 Próximo a vencer
          </span>
        );
      }
    }

    return (
      <span className="badge bg-success">
        🟢 OK
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">

      {/* HEADER */}
      <div className="mb-4">
        <h1 className="fw-bold">
          📊 Dashboard Inteligente de Inventario
        </h1>

        <p className="text-muted">
          Control avanzado de inventario médico y laboratorio
        </p>
      </div>

      {/* KPIs */}
      <div className="row mb-4">

        <div className="col-md-3 mb-3">
          <div className="card shadow border-0 bg-primary text-white">
            <div className="card-body">
              <h6>Total Productos</h6>
              <h2>{datos.estadisticasGenerales.total}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow border-0 bg-success text-white">
            <div className="card-body">
              <h6>Productos Registrados</h6>
              <h2>{datos.estadisticasGenerales.asignados}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow border-0 bg-danger text-white">
            <div className="card-body">
              <h6>Stock Crítico</h6>
              <h2>{datos.productosCriticos.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow border-0 bg-dark text-white">
            <div className="card-body">
              <h6>Valor Inventario</h6>
              <h2>
                $
                {datos.valorInventario.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* GRÁFICAS */}
      <div className="row mb-4">

        <div className="col-md-6 mb-4">
          <div className="card shadow border-0 h-100">
            <div className="card-header bg-info text-white">
              Productos por Categoría
            </div>

            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datos.productosPorCategoria}
                    dataKey="cantidad"
                    nameKey="nombre"
                    outerRadius={100}
                    label
                  >
                    {datos.productosPorCategoria.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            COLORS[index % COLORS.length]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow border-0 h-100">
            <div className="card-header bg-success text-white">
              Productos por Ubicación
            </div>

            <div className="card-body">

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos.ubicaciones}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="cantidad"
                    fill="#198754"
                  />
                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>
        </div>

      </div>

      {/* TABLA ALERTAS */}
      <div className="card shadow border-0 mb-4">

        <div className="card-header bg-danger text-white">
          🚨 Alertas Inteligentes
        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-dark">
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
  {datos.productosRecientes.map((codigo, idx) => {

    const producto = codigo.producto;

    const stockCritico =
      producto.stock <= 3;

    return (
      <tr
        key={idx}
        className={
          stockCritico
            ? "table-danger"
            : ""
        }
      >
        <td>
          <strong>
            {producto.nombre}
          </strong>
        </td>

        <td>
          <span
            className={`badge ${
              stockCritico
                ? "bg-danger"
                : "bg-success"
            }`}
          >
            {producto.stock}
          </span>
        </td>

        <td>
          {producto.fechaVencimiento
            ? new Date(
                producto.fechaVencimiento
              ).toLocaleDateString()
            : "N/A"}
        </td>

        <td>
          {badgeEstado(producto)}
        </td>
      </tr>
    );
  })}
</tbody>

</table>
</div>
</div>
</div>

</div>
);
}
