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

    alert("Respuesta recibida");

    const codigoEncontrado = res.data;

    alert(JSON.stringify(codigoEncontrado));

    console.log("TIPO codigoEncontrado:", typeof codigoEncontrado);
    console.log("CODIGO ENCONTRADO API:", codigoEncontrado);

    if (codigoEncontrado.estado === "asignado") {
      setError("⚠️ Este código ya tiene un producto asignado");
      setCodigoActual(codigoEncontrado);
      limpiarFormulario();
    } else {
      alert("Asignando codigoActual");

      setCodigoActual(codigoEncontrado);
      setScanning(false);
    }

  } catch (err) {
    console.error(err);

    alert(
      err?.response?.data?.message ||
      err?.message ||
      "Error desconocido"
    );

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
    setScanning(false);

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
  <div
    style={{
      background: "lightgreen",
      padding: "20px",
      marginTop: "20px",
      fontSize: "20px",
    }}
  >
    Código cargado correctamente:
    <br />
    {codigoActual.codigo}
    <br />
    Estado:
    {codigoActual.estado}
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
