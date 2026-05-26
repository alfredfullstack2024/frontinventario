import { useState, useEffect } from "react";
import api from "../services/api";
import BarcodeScanner from "../components/BarcodeScanner";

export default function AsignarProductos() {
  const [scanning, setScanning] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [codigoActual, setCodigoActual] = useState(null);
  const [codigoManual, setCodigoManual] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Datos del producto
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [stock, setStock] = useState(1);
  const [referencia, setReferencia] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [marcaFabricante, setMarcaFabricante] = useState("");
  const [registroInvima, setRegistroInvima] = useState("");
  const [clasificacionRiesgo, setClasificacionRiesgo] = useState("");

  const [cantidadMinimaMensual, setCantidadMinimaMensual] = useState("");
  const [cantidadMaximaMensual, setCantidadMaximaMensual] = useState("");

  const [numeroLote, setNumeroLote] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [numeroRemisionFactura, setNumeroRemisionFactura] = useState("");

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const buscarCodigo = async (codigo) => {
  try {
    setError("");
    setExito("");

    const codigoLimpio = codigo.trim();

    const res = await api.get(
      `/codigos/${encodeURIComponent(codigoLimpio)}`
    );

    

    const codigoEncontrado = res.data;

    

    console.log("TIPO codigoEncontrado:", typeof codigoEncontrado);
    console.log("CODIGO ENCONTRADO API:", codigoEncontrado);

    if (codigoEncontrado.estado === "asignado") {
      setError("⚠️ Este código ya tiene un producto asignado");
      setCodigoActual(codigoEncontrado);
      limpiarFormulario();
    } else {
      

      setCodigoActual(codigoEncontrado);
setScanning(false);
      
    }

  } catch (err) {
    console.error(err);

        setError(err?.response?.data?.message || err?.message || "Error desconocido");

    setError("❌ Código no encontrado");
    setCodigoActual(null);
  }
};

  const handleDetected = (codigo) => {
    // Evitar múltiples lecturas
    if (!codigo || codigoActual) return;

    // Validar tipo
    if (typeof codigo !== "string") {
      console.error("Código inválido detectado:", codigo);
      return;
    }

    console.log("Código detectado:", codigo);

    // Detener scanner inmediatamente
    
    buscarCodigo(codigo);
  };

  const buscarManual = (e) => {
    e.preventDefault();
    if (codigoManual.trim()) {
      buscarCodigo(codigoManual.trim());
      setCodigoManual("");
    }
  };
  const buscarSugerencias = async (texto) => {
    try {
      if (texto.trim().length < 1) {
        setSugerencias([]);
        return;
      }

      const res = await api.get(`/codigos/buscar/${encodeURIComponent(texto)}`);

      setSugerencias(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const asignarProducto = async (e) => {
    e.preventDefault();
    if (!codigoActual || !codigoActual.codigo || !nombre.trim()) {
      setError("❌ Código inválido o faltan datos");

      console.error("codigoActual inválido:", codigoActual);

      return;
    }

    try {
      console.log("ANTES PUT:", codigoActual);
      console.log("CODIGO STRING:", codigoActual.codigo);
      console.log("DATOS A ENVIAR:");

      console.log({
        nombre,
        referencia,
        presentacion,
        marcaFabricante,
        registroInvima,
        clasificacionRiesgo,

        descripcion,
        precio,
        categoria,
        ubicacion,
        stock,

        cantidadMinimaMensual,
        cantidadMaximaMensual,

        numeroLote,
        fechaVencimiento,
        numeroRemisionFactura,
      });
      const res = await api.put(`/codigos/${codigoActual.codigo}/asignar`, {
        // Información principal
        nombre,
        referencia,
        presentacion,
        marcaFabricante,
        registroInvima,
        clasificacionRiesgo,

        // Información producto
        descripcion,
        precio: precio ? parseFloat(precio) : null,
        categoria: categoria || null,
        ubicacion,
        stock: parseInt(stock),

        // Control inventario
        cantidadMinimaMensual: cantidadMinimaMensual
          ? parseInt(cantidadMinimaMensual)
          : 0,

        cantidadMaximaMensual: cantidadMaximaMensual
          ? parseInt(cantidadMaximaMensual)
          : 0,

        // Información lote
        numeroLote,
        fechaVencimiento,
        numeroRemisionFactura,
      });

      setExito(
        `✅ Producto "${nombre}" asignado exitosamente al código ${codigoActual.codigo}`,
      );
      setCodigoActual(res.data.codigo);
      limpiarFormulario();
    } catch (error) {
      setError("❌ Error al asignar producto");
      console.error(error);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCategoria("");
    setUbicacion("");
    setStock(1);

    setReferencia("");
    setPresentacion("");
    setMarcaFabricante("");
    setRegistroInvima("");
    setClasificacionRiesgo("");

    setCantidadMinimaMensual("");
    setCantidadMaximaMensual("");

    setNumeroLote("");
    setFechaVencimiento("");
    setNumeroRemisionFactura("");
  };

  const nuevoEscaneo = () => {
    setCodigoActual(null);
    setError("");
    setExito("");
    limpiarFormulario();
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-10 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h2 className="mb-0">📱 Asignar Productos a Códigos</h2>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                Escanea un código generado para asignarle la información del
                producto
              </p>

              {/* Controles de escáner */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <button
                    onClick={() => setScanning(!scanning)}
                    className={`btn btn-lg w-100 ${
                      scanning ? "btn-danger" : "btn-primary"
                    }`}
                  >
                    {scanning ? "⏹️ Detener Escáner" : "📷 Iniciar Escáner"}
                  </button>
                </div>
                <div className="col-md-6">
                  <form onSubmit={buscarManual} className="d-flex">
                    <div className="position-relative flex-grow-1">
                      <input
                        className="form-control"
                        value={codigoManual}
                        placeholder="Buscar código disponible..."
                        onChange={(e) => {
                          setCodigoManual(e.target.value);
                          buscarSugerencias(e.target.value);
                        }}
                      />

                      {sugerencias.length > 0 && (
                        <ul
                          className="list-group position-absolute w-100 shadow"
                          style={{
                            zIndex: 9999,
                            maxHeight: "250px",
                            overflowY: "auto",
                          }}
                        >
                          {sugerencias.map((item) => (
                            <li
                              key={item._id}
                              className="list-group-item list-group-item-action"
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setCodigoManual(item.codigo);
                                setSugerencias([]);
                                buscarCodigo(item.codigo);
                              }}
                            >
                              {item.codigo}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button type="submit" className="btn btn-success ms-2">
                      🔍
                    </button>
                  </form>
                </div>
              </div>

              {/* Escáner */}
              {scanning && (
                <div className="alert alert-primary">
                  <p className="mb-2">
                    📱 <strong>Apunta la cámara al código de barras</strong>
                  </p>
                  <BarcodeScanner onDetected={handleDetected} />
                </div>
              )}

              {/* Mensajes */}
              {error && <div className="alert alert-danger">{error}</div>}

              {exito && <div className="alert alert-success">{exito}</div>}

              {/* Información del código actual */}
              {codigoActual && (
                <div className="card mb-4 border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">📋 Código: {codigoActual.codigo}</h5>
                  </div>
                  <div className="card-body">
                    {codigoActual.estado === "asignado" ? (
                      <div>
                        <div className="alert alert-warning">
                          <strong>⚠️ Este código ya está asignado:</strong>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <p>
                              <strong>Producto:</strong>{" "}
                              {codigoActual.producto.nombre}
                            </p>
                            <p>
                              <strong>Descripción:</strong>{" "}
                              {codigoActual.producto.descripcion || "N/A"}
                            </p>
                            <p>
                              <strong>Precio:</strong> $
                              {codigoActual.producto.precio || "N/A"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p>
                              <strong>Categoría:</strong>{" "}
                              {codigoActual.producto.categoria?.nombre || "N/A"}
                            </p>
                            <p>
                              <strong>Ubicación:</strong>{" "}
                              {codigoActual.producto.ubicacion || "N/A"}
                            </p>
                            <p>
                              <strong>Stock:</strong>{" "}
                              {codigoActual.producto.stock}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={nuevoEscaneo}
                          className="btn btn-secondary"
                        >
                          🔄 Escanear Otro Código
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="alert alert-success">
                          <strong>
                            ✅ Código disponible - Asigna la información del
                            producto:
                          </strong>
                        </div>

                        <form onSubmit={asignarProducto}>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Nombre del Producto *
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={nombre}
                                  onChange={(e) => setNombre(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Referencia del Producto
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={referencia}
                                  onChange={(e) =>
                                    setReferencia(e.target.value)
                                  }
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Presentación
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={presentacion}
                                  onChange={(e) =>
                                    setPresentacion(e.target.value)
                                  }
                                  placeholder="Caja x100, Frasco 500ml..."
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Marca Fabricante
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={marcaFabricante}
                                  onChange={(e) =>
                                    setMarcaFabricante(e.target.value)
                                  }
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Registro INVIMA
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={registroInvima}
                                  onChange={(e) =>
                                    setRegistroInvima(e.target.value)
                                  }
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Descripción
                                </label>
                                <textarea
                                  className="form-control"
                                  value={descripcion}
                                  onChange={(e) =>
                                    setDescripcion(e.target.value)
                                  }
                                  rows="2"
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Precio
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control"
                                  value={precio}
                                  onChange={(e) => setPrecio(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Categoría
                                </label>
                                <select
                                  className="form-control"
                                  value={categoria}
                                  onChange={(e) => setCategoria(e.target.value)}
                                >
                                  <option value="">
                                    Seleccionar categoría
                                  </option>
                                  {categorias.map((c) => (
                                    <option key={c._id} value={c._id}>
                                      {c.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Clasificación del Riesgo
                                </label>

                                <select
                                  className="form-control"
                                  value={clasificacionRiesgo}
                                  onChange={(e) =>
                                    setClasificacionRiesgo(e.target.value)
                                  }
                                >
                                  <option value="">Seleccione</option>
                                  <option value="Clase I">Clase I</option>
                                  <option value="Clase IIA">Clase IIA</option>
                                  <option value="Clase IIB">Clase IIB</option>
                                  <option value="Clase III">Clase III</option>
                                </select>
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Ubicación
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={ubicacion}
                                  onChange={(e) => setUbicacion(e.target.value)}
                                  placeholder="Ej: Pasillo A, Estante 3"
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Stock
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={stock}
                                  onChange={(e) =>
                                    setStock(parseInt(e.target.value))
                                  }
                                  min="1"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Cantidad Mínima Mensual
                            </label>

                            <input
                              type="number"
                              className="form-control"
                              value={cantidadMinimaMensual}
                              onChange={(e) =>
                                setCantidadMinimaMensual(e.target.value)
                              }
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Cantidad Máxima Mensual
                            </label>

                            <input
                              type="number"
                              className="form-control"
                              value={cantidadMaximaMensual}
                              onChange={(e) =>
                                setCantidadMaximaMensual(e.target.value)
                              }
                            />
                          </div>
                          <hr className="my-4" />

                          <h5 className="mb-3">
                            📦 Información del Lote Inicial
                          </h5>

                          <div className="row">
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  # Lote
                                </label>

                                <input
                                  type="text"
                                  className="form-control"
                                  value={numeroLote}
                                  onChange={(e) =>
                                    setNumeroLote(e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Fecha de Vencimiento
                                </label>

                                <input
                                  type="date"
                                  className="form-control"
                                  value={fechaVencimiento}
                                  onChange={(e) =>
                                    setFechaVencimiento(e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label fw-bold">
                                  Remisión / Factura
                                </label>

                                <input
                                  type="text"
                                  className="form-control"
                                  value={numeroRemisionFactura}
                                  onChange={(e) =>
                                    setNumeroRemisionFactura(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button
                              type="button"
                              onClick={nuevoEscaneo}
                              className="btn btn-secondary"
                            >
                              🔄 Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn btn-success btn-lg"
                            >
                              💾 Asignar Producto
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
