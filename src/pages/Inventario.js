import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export default function Inventario() {
  const [codigos, setCodigos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [, setLoading] = useState(true);
  const [codigoSeleccionado, setCodigoSeleccionado] = useState(null);
  const [mostrarModalSalida, setMostrarModalSalida] = useState(false);
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false);

  const [cantidadEntrada, setCantidadEntrada] = useState(1);

const [observacionEntrada, setObservacionEntrada] = useState("");

const [numeroLoteEntrada, setNumeroLoteEntrada] = useState("");

const [fechaVencimientoEntrada, setFechaVencimientoEntrada] = useState("");

const [numeroFacturaEntrada, setNumeroFacturaEntrada] = useState("");
  const [refCajaEntrada, setRefCajaEntrada] = useState("");

const [refTarroEntrada, setRefTarroEntrada] = useState("");

const [procesandoEntrada, setProcesandoEntrada] = useState(false);
  const [cantidadSalida, setCantidadSalida] = useState(1);

  const [motivoSalida, setMotivoSalida] = useState("");

  const [observacionSalida, setObservacionSalida] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");

const [infoLoteSeleccionado, setInfoLoteSeleccionado] = useState(null);

  const [procesandoSalida, setProcesandoSalida] = useState(false);
  const [movimientosCodigo, setMovimientosCodigo] = useState([]);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarLotes, setMostrarLotes] = useState(false);

const [lotesCodigo, setLotesCodigo] = useState([]);

const [cargandoLotes, setCargandoLotes] = useState(false);

  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const cargarCodigos = useCallback(async () => {
    try {
      setLoading(true);
      const estado = filtro === "todos" ? "" : filtro;
      const res = await api.get(
        `https://backinventario-wns5.onrender.com/api/codigos?estado=${estado}&limit=100`,
      );
      console.log(res.data);
      setCodigos(res.data);
    } catch (error) {
      console.error("Error cargando códigos:", error);
      setCodigos([]);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    cargarCodigos();
  }, [cargarCodigos]);

  const codigosFiltrados = codigos.filter((codigo) => {
    if (!busqueda) return true;

    const termino = busqueda.toLowerCase();
    return (
      codigo.codigo.toLowerCase().includes(termino) ||
      (codigo.producto.nombre &&
        codigo.producto.nombre.toLowerCase().includes(termino)) ||
      (codigo.producto.descripcion &&
        codigo.producto.descripcion.toLowerCase().includes(termino))
    );
  });

  const mostrarDetalle = (codigo) => {
    setCodigoSeleccionado(codigo);
  };
const abrirModalSalida = (codigo) => {

  setCodigoSeleccionado(codigo);

  setCantidadSalida(1);

  setMotivoSalida("");

  setObservacionSalida("");

  setLoteSeleccionado("");

  setInfoLoteSeleccionado(null);

  setMostrarModalSalida(true);
};
  const abrirModalEntrada = (codigo) => {

  setCodigoSeleccionado(codigo);

  setCantidadEntrada(1);

  setObservacionEntrada("");

  setNumeroLoteEntrada("");

  setFechaVencimientoEntrada("");

  setNumeroFacturaEntrada("");
    setRefCajaEntrada("");

setRefTarroEntrada("");

  setMostrarModalEntrada(true);
};
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case "asignado":
        return "bg-success";

      case "disponible":
        return "bg-warning text-dark";

      case "salida":
        return "bg-secondary";

      case "dañado":
        return "bg-danger";

      case "perdido":
        return "bg-dark";

      case "mantenimiento":
        return "bg-info text-dark";

      default:
        return "bg-light text-dark";
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case "asignado":
        return "✅ Asignado";

      case "disponible":
        return "⏳ Disponible";

      case "salida":
        return "📦 Sin Stock";

      case "dañado":
        return "❌ Dañado";

      case "perdido":
        return "⚫ Perdido";

      case "mantenimiento":
        return "🛠️ Mantenimiento";

      default:
        return estado;
    }
  };
  const calcularDiasRestantes = (fechaVencimiento) => {
    const hoy = new Date();

    const vencimiento = new Date(fechaVencimiento);

    const diferencia = vencimiento - hoy;

    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };
const seleccionarLote = (loteId) => {

  setLoteSeleccionado(loteId);

  const lote = codigoSeleccionado.lotes?.find(
    (l) => l._id === loteId
  );

  setInfoLoteSeleccionado(lote || null);
};
  
 const registrarSalida = async () => {
  try {

    if (!motivoSalida.trim()) {
      alert("Debes ingresar un motivo");
      return;
    }

    if (!loteSeleccionado) {
      alert("Debes seleccionar un lote");
      return;
    }

    setProcesandoSalida(true);
      await api.post("https://backinventario-wns5.onrender.com/api/movimientos", {

  codigoId: codigoSeleccionado._id,

  loteId: loteSeleccionado,

  tipo: "salida",

  cantidad: Number(cantidadSalida),

  motivo: motivoSalida,

  observacion: observacionSalida,

});

      setMostrarModalSalida(false);

      await cargarCodigos();

      alert("✅ Salida registrada correctamente");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.error || "Error registrando salida");
    } finally {
      setProcesandoSalida(false);
    }
  };
  const registrarEntrada = async () => {
    try {
      setProcesandoEntrada(true);

      await api.post("https://backinventario-wns5.onrender.com/api/lotes/entrada", {

  codigoId: codigoSeleccionado._id,

  cantidad: Number(cantidadEntrada),

  observacion: observacionEntrada,

  numeroLote: numeroLoteEntrada,

  fechaVencimiento: fechaVencimientoEntrada,

  numeroRemisionFactura: numeroFacturaEntrada,
refCaja: refCajaEntrada,
  refTarro: refTarroEntrada,
});

      setMostrarModalEntrada(false);

      await cargarCodigos();

      alert("✅ Entrada registrada correctamente");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.error || "Error registrando entrada");
    } finally {
      setProcesandoEntrada(false);
    }
  };
  const abrirHistorial = async (codigo) => {
    try {
      setCodigoSeleccionado(codigo);

      setMostrarHistorial(true);

      setCargandoHistorial(true);

      const res = await api.get(
        `https://backinventario-wns5.onrender.com/api/movimientos/${codigo._id}`,
      );

      const abrirLotes = async (codigo) => {
  try {
    setCodigoSeleccionado(codigo);

    setMostrarLotes(true);

    setCargandoLotes(true);

    const res = await api.get(
      `https://backinventario-wns5.onrender.com/api/lotes/codigo/${codigo._id}`
    );

    setLotesCodigo(res.data);
  } catch (error) {
    console.error(error);

    alert("Error cargando lotes");
  } finally {
    setCargandoLotes(false);
  }
};
      setMovimientosCodigo(res.data);
    } catch (error) {
      console.error(error);

      alert("Error cargando historial");
    } finally {
      setCargandoHistorial(false);
    }
  };
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h2 className="mb-0">📋 Inventario Completo</h2>
            </div>
            <div className="card-body">
              {/* Filtros y búsqueda */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label fw-bold">
                    Filtrar por estado:
                  </label>
                  <select
                    className="form-control"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  >
                    <option value="todos">Todos los códigos</option>
                    <option value="disponible">Disponibles</option>
                    <option value="asignado">Asignados</option>
                    <option value="salida">Sin Stock</option>
                    <option value="dañado">Dañados</option>
                    <option value="perdido">Perdidos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-bold">Buscar:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por código, nombre o descripción..."
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="alert alert-info">
                <strong>📊 Resumen:</strong> Mostrando {codigosFiltrados.length}{" "}
                de {codigos.length} códigos
              </div>

              {/* Tabla de códigos */}
              {codigosFiltrados.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Código</th>
                        <th>Estado</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Vencimiento</th>
                        <th>Fecha Creación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codigosFiltrados.map((codigo) => (
                        <tr key={codigo._id}>
                          <td>
                            <code className="bg-light p-1 rounded">
                              {codigo.codigo}
                            </code>
                          </td>
                          <td>
                            <span
                              className={`badge ${obtenerClaseEstado(codigo.estado)}`}
                            >
                              {obtenerTextoEstado(codigo.estado)}
                            </span>
                          </td>
                          <td>
                            {codigo.estado === "asignado" ? (
                              codigo.producto.nombre
                            ) : (
                              <span className="text-muted">Sin asignar</span>
                            )}
                          </td>
                          <td>
                            {codigo.producto.categoria?.nombre || (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            {codigo.producto.precio ? (
                              `$${codigo.producto.precio.toFixed(2)}`
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {codigo.producto.stock || 0}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              {codigo.lotes?.length > 0 ? (
                                codigo.lotes.map((lote) => {
                                  const dias = calcularDiasRestantes(
                                    lote.fechaVencimiento,
                                  );

                                  return (
                                    <div
                                      key={lote._id}
                                      className="rounded-circle"
                                      title={`
Stock: ${lote.stockDisponible}
Vence en ${dias} días
  `}
                                      style={{
                                        width: "18px",
                                        height: "18px",

                                        backgroundColor:
                                          dias <= 15
                                            ? "#dc3545"
                                            : dias <= 60
                                              ? "#ffc107"
                                              : "#198754",
                                      }}
                                    />
                                  );
                                })
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <small>
                              {formatearFecha(codigo.fechaGeneracion)}
                            </small>
                          </td>
                          <td>
                            <button
                              onClick={() => mostrarDetalle(codigo)}
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              👁️ Ver
                            </button>
                            <button
                              onClick={() => abrirModalEntrada(codigo)}
                              className="btn btn-sm btn-outline-success me-2"
                              disabled={
                                !["asignado", "salida"].includes(codigo.estado)
                              }
                            >
                              ➕ Entrada
                            </button>
                            <button
                              onClick={() => abrirModalSalida(codigo)}
                              className="btn btn-sm btn-outline-danger me-2"
                              disabled={codigo.estado !== "asignado"}
                            >
                              ➖ Salida
                            </button>
                            <button
                              onClick={() => abrirHistorial(codigo)}
                              className="btn btn-sm btn-outline-dark me-2"
                            >
                              📜 Historial
                            </button>
                                <button
  onClick={() => abrirLotes(codigo)}
  className="btn btn-sm btn-outline-warning me-2"
>
  📦 Lotes
</button>
                            <a
                              href={`https://backinventario-wns5.onrender.com/api/barcode/${codigo.codigo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                            >
                                
                              🖨️ Código
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <div className="display-1 mb-3">📭</div>
                  <h4>No hay códigos que mostrar</h4>
                  <p>No se encontraron códigos con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {codigoSeleccionado && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  📋 Detalle del Código: {codigoSeleccionado.codigo}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCodigoSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Información del Código:</h6>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Código:</strong> {codigoSeleccionado.codigo}
                      </li>
                      <li>
                        <strong>Estado:</strong>
                        <span
                          className={`badge ms-2 ${obtenerClaseEstado(codigoSeleccionado.estado)}`}
                        >
                          {obtenerTextoEstado(codigoSeleccionado.estado)}
                        </span>
                      </li>
                      <li>
                        <strong>Fecha Creación:</strong>{" "}
                        {formatearFecha(codigoSeleccionado.fechaGeneracion)}
                      </li>
                      {codigoSeleccionado.fechaAsignacion && (
                        <li>
                          <strong>Fecha Asignación:</strong>{" "}
                          {formatearFecha(codigoSeleccionado.fechaAsignacion)}
                        </li>
                      )}
                    </ul>

                    {codigoSeleccionado.estado === "asignado" && (
                      <>
                        <ul className="list-unstyled">
                          <li>
                            <strong>Nombre:</strong>{" "}
                            {codigoSeleccionado.producto.nombre || "N/A"}
                          </li>

                          <li>
                            <strong>Referencia:</strong>{" "}
                            {codigoSeleccionado.producto.referencia || "N/A"}
                          </li>

                          <li>
                            <strong>Presentación:</strong>{" "}
                            {codigoSeleccionado.producto.presentacion || "N/A"}
                          </li>

                          <li>
                            <strong>Marca Fabricante:</strong>{" "}
                            {codigoSeleccionado.producto.marcaFabricante ||
                              "N/A"}
                          </li>

                          <li>
                            <strong>Registro INVIMA:</strong>{" "}
                            {codigoSeleccionado.producto.registroInvima ||
                              "N/A"}
                          </li>

                          <li>
                            <strong>Clasificación Riesgo:</strong>{" "}
                            {codigoSeleccionado.producto.clasificacionRiesgo ||
                              "N/A"}
                          </li>

                          <li>
                            <strong>Descripción:</strong>{" "}
                            {codigoSeleccionado.producto.descripcion || "N/A"}
                          </li>

                          <li>
                            <strong>Precio:</strong>{" "}
                            {codigoSeleccionado.producto.precio
                              ? `$${codigoSeleccionado.producto.precio.toLocaleString()}`
                              : "N/A"}
                          </li>

                          <li>
                            <strong>Categoría:</strong>{" "}
                            {codigoSeleccionado.producto.categoria?.nombre ||
                              "N/A"}
                          </li>

                          <li>
                            <strong>Ubicación:</strong>{" "}
                            {codigoSeleccionado.producto.ubicacion || "N/A"}
                          </li>

                          <li>
                            <strong>Stock:</strong>{" "}
                            {codigoSeleccionado.producto.stock || 0}
                          </li>

                          <li>
                            <strong>Cantidad Mínima:</strong>{" "}
                            {codigoSeleccionado.producto
                              .cantidadMinimaMensual || 0}
                          </li>

                          <li>
                            <strong>Cantidad Máxima:</strong>{" "}
                            {codigoSeleccionado.producto
                              .cantidadMaximaMensual || 0}
                          </li>

                          <li>
                            <strong>Número Lote:</strong>{" "}
                            {codigoSeleccionado.producto.numeroLote || "N/A"}
                          </li>

                          <li>
                            <strong>Fecha Vencimiento:</strong>{" "}
                            {codigoSeleccionado.producto.fechaVencimiento
                              ? new Date(
                                  codigoSeleccionado.producto.fechaVencimiento,
                                ).toLocaleDateString("es-CO")
                              : "N/A"}
                          </li>

                          <li>
                            <strong>Remisión / Factura:</strong>{" "}
                            {codigoSeleccionado.producto
                              .numeroRemisionFactura || "N/A"}
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="col-md-6 text-center">
                    <h6 className="fw-bold">Código de Barras:</h6>
                    <img
                      src={`https://backinventario-wns5.onrender.com/api/barcode/${codigoSeleccionado.codigo}`}
                      alt={codigoSeleccionado.codigo}
                      className="img-fluid border rounded"
                    />
                    <div className="mt-3">
                      <a
                        href={`https://backinventario-wns5.onrender.com/api/barcode/${codigoSeleccionado.codigo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        🖨️ Imprimir Código
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCodigoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {mostrarModalSalida && codigoSeleccionado && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">➖ Registrar Salida</h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModalSalida(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Producto</label>

                  <input
                    type="text"
                    className="form-control"
                    disabled
                    value={codigoSeleccionado.producto?.nombre || ""}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Stock Actual</label>

                  <input
                    type="number"
                    className="form-control"
                    disabled
                    value={codigoSeleccionado.producto?.stock || 0}
                  />
                </div>
<div className="mb-3">

  <label className="form-label fw-bold">
    Seleccionar Lote
  </label>

  <select
    className="form-control"
    value={loteSeleccionado}
    onChange={(e) => seleccionarLote(e.target.value)}
  >

    <option value="">
      Seleccione un lote
    </option>

    {codigoSeleccionado.lotes
      ?.filter((lote) => lote.stockDisponible > 0)
      .map((lote) => (

        <option key={lote._id} value={lote._id}>

          {lote.numeroLote || "SIN LOTE"} | Stock:
          {" "}
          {lote.stockDisponible}
          {" "}
          | Vence:
          {" "}
          {lote.fechaVencimiento
            ? new Date(
                lote.fechaVencimiento
              ).toLocaleDateString("es-CO")
            : "N/A"}

        </option>
      ))}
  </select>
</div>
    {infoLoteSeleccionado && (

  <div className="alert alert-warning">

    <strong>Lote:</strong>
    {" "}
    {infoLoteSeleccionado.numeroLote || "N/A"}

    <br />

    <strong>Stock Disponible:</strong>
    {" "}
    {infoLoteSeleccionado.stockDisponible}

    <br />

    <strong>Vencimiento:</strong>
    {" "}
    {infoLoteSeleccionado.fechaVencimiento
      ? new Date(
          infoLoteSeleccionado.fechaVencimiento
        ).toLocaleDateString("es-CO")
      : "N/A"}

  </div>
)}
                <div className="mb-3">
                  <label className="form-label fw-bold">Cantidad Salida</label>

                  <input
                    type="number"
                    min="1"
                    max={codigoSeleccionado.producto?.stock || 1}
                    className="form-control"
                    value={cantidadSalida}
                    onChange={(e) => setCantidadSalida(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Motivo</label>

                  <input
                    type="text"
                    className="form-control"
                    value={motivoSalida}
                    onChange={(e) => setMotivoSalida(e.target.value)}
                    placeholder="Ej: entrega empleado"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Observación</label>

                  <textarea
                    className="form-control"
                    rows="3"
                    value={observacionSalida}
                    onChange={(e) => setObservacionSalida(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostrarModalSalida(false)}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-danger"
                  onClick={registrarSalida}
                  disabled={procesandoSalida}
                >
                  {procesandoSalida ? "Procesando..." : "Registrar Salida"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {mostrarModalEntrada && codigoSeleccionado && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">➕ Registrar Entrada</h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModalEntrada(false)}
                />
              </div>

              <div className="modal-body">

  <div className="mb-3">
    <label className="form-label fw-bold">
      Producto
    </label>

    <input
      type="text"
      className="form-control"
      disabled
      value={codigoSeleccionado.producto?.nombre || ""}
    />
  </div>

  <div className="mb-3">
    <label className="form-label fw-bold">
      Stock Actual
    </label>

    <input
      type="number"
      className="form-control"
      disabled
      value={codigoSeleccionado.producto?.stock || 0}
    />
  </div>

  <div className="mb-3">
    <label className="form-label fw-bold">
      Cantidad Entrada
    </label>

    <input
      type="number"
      min="1"
      className="form-control"
      value={cantidadEntrada}
      onChange={(e) => setCantidadEntrada(e.target.value)}
    />
  </div>

  <hr />

  <h6 className="fw-bold mb-3">
    📦 Información del Nuevo Lote
  </h6>

  <div className="mb-3">
    <label className="form-label fw-bold">
      Número de Lote
    </label>

    <input
      type="text"
      className="form-control"
      value={numeroLoteEntrada}
      onChange={(e) =>
        setNumeroLoteEntrada(e.target.value)
      }
      placeholder="Ej: LOT-2026-001"
    />
  </div>
        <div className="mb-3">
  <label className="form-label fw-bold">
    REF Caja
  </label>

  <input
    type="text"
    className="form-control"
    value={refCajaEntrada}
    onChange={(e) => setRefCajaEntrada(e.target.value)}
    placeholder="Opcional"
  />
</div>

<div className="mb-3">
  <label className="form-label fw-bold">
    REF Tarro
  </label>

  <input
    type="text"
    className="form-control"
    value={refTarroEntrada}
    onChange={(e) => setRefTarroEntrada(e.target.value)}
    placeholder="Opcional"
  />
</div>

  <div className="mb-3">
    <label className="form-label fw-bold">
      Fecha de Vencimiento
    </label>

    <input
      type="date"
      className="form-control"
      value={fechaVencimientoEntrada}
      onChange={(e) =>
        setFechaVencimientoEntrada(e.target.value)
      }
    />
  </div>

  <div className="mb-3">
    <label className="form-label fw-bold">
      Remisión / Factura
    </label>

    <input
      type="text"
      className="form-control"
      value={numeroFacturaEntrada}
      onChange={(e) =>
        setNumeroFacturaEntrada(e.target.value)
      }
      placeholder="Ej: FAC-2026-001"
    />
  </div>

  <div className="mb-3">
    <label className="form-label fw-bold">
      Observación
    </label>

    <textarea
      className="form-control"
      rows="3"
      value={observacionEntrada}
      onChange={(e) =>
        setObservacionEntrada(e.target.value)
      }
    />
  </div>

  <div className="alert alert-info">
  📦 Cada entrada puede registrar un lote,
  vencimiento y factura diferente para mantener
  trazabilidad completa.

  <hr />

  📅 Este ingreso generará automáticamente
  seguimiento de vencimiento y trazabilidad
  histórica del lote.
</div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostrarModalEntrada(false)}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-success"
                  onClick={registrarEntrada}
                  disabled={procesandoEntrada}
                >
                  {procesandoEntrada ? "Procesando..." : "Registrar Entrada"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {mostrarHistorial && codigoSeleccionado && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">📜 Historial de Movimientos</h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarHistorial(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <h6>
                    Código:
                    <code className="ms-2">{codigoSeleccionado.codigo}</code>
                  </h6>

                  <h6>
                    Producto:
                    <strong className="ms-2">
                      {codigoSeleccionado.producto?.nombre}
                    </strong>
                  </h6>
                </div>

                {cargandoHistorial ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                  </div>
                ) : movimientosCodigo.length === 0 ? (
                  <div className="alert alert-info">
                    No hay movimientos registrados
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Tipo</th>
                          <th>Cantidad</th>
                          <th>Stock</th>
                          <th>Motivo</th>
                          <th>Observación</th>
<th>Lote</th>
<th>Vencimiento</th>
<th>Factura</th>
<th>Fecha</th>
                        </tr>
                      </thead>

                      <tbody>
                        {movimientosCodigo.map((mov) => (
                          <tr key={mov._id}>
                            <td>
                              <span className="badge bg-primary">
                                {mov.tipo}
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

                            <td>{mov.motivo || "N/A"}</td>

                           <td>{mov.observacion || "N/A"}</td>

<td>
  <span className="badge bg-dark">
    {mov.numeroLote || "N/A"}
  </span>
</td>

<td>
  {mov.fechaVencimiento
    ? new Date(
        mov.fechaVencimiento
      ).toLocaleDateString("es-CO")
    : "N/A"}
</td>

<td>
  {mov.numeroRemisionFactura || "N/A"}
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

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostrarHistorial(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
