import { useEffect, useState } from "react";
import api from "../services/api";

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      setLoading(true);

      const res = await api.get("/movimientos");

      setMovimientos(res.data);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CO");
  };

  const obtenerColorTipo = (tipo) => {
    switch (tipo) {
      case "entrada":
        return "success";

      case "salida":
        return "danger";

      case "ajuste":
        return "warning";

      case "perdida":
        return "dark";

      case "dañado":
        return "secondary";

      case "mantenimiento":
        return "info";

      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-dark text-white">
          <h2 className="mb-0">📜 Historial de Movimientos</h2>
        </div>

        <div className="card-body">
          {movimientos.length === 0 ? (
            <div className="alert alert-info">
              No hay movimientos registrados
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Tipo</th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Usuario</th>
                    <th>Cantidad</th>
                    <th>Stock</th>
                    <th>Motivo</th>
                    <th>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.map((mov) => (
                    <tr key={mov._id}>
                      <td>
                        <span
                          className={`badge bg-${obtenerColorTipo(mov.tipo)}`}
                        >
                          {mov.tipo.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <code>{mov.codigo?.codigo}</code>
                      </td>

                      <td>{mov.codigo?.producto?.nombre || "N/A"}</td>

                      <td>
                        <span className="badge bg-info">
                          👤 {mov.usuario?.nombre || "Sistema"}
                        </span>
                      </td>

                      <td>{mov.cantidad}</td>

                      <td>
                        <span className="badge bg-secondary">
                          {mov.stockAnterior}
                          {" → "}
                          {mov.stockNuevo}
                        </span>
                      </td>

                      <td>
                        <div>
                          <strong>{mov.motivo || "N/A"}</strong>

                          {mov.observacion && (
                            <div className="small text-muted">
                              {mov.observacion}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <small>{formatearFecha(mov.createdAt)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
