import { useState, useEffect } from "react";
import axios from "axios";

export default function GenerarEtiquetas() {
  const [cantidad, setCantidad] = useState(10);
  const [rangoInicio, setRangoInicio] = useState("");
  const [rangoFin, setRangoFin] = useState("");
  const [modoGeneracion, setModoGeneracion] = useState("cantidad"); // "cantidad" o "rango"
  const [generando, setGenerando] = useState(false);
  const [codigosGenerados, setCodigosGenerados] = useState([]);
  const [mostrarCodigos, setMostrarCodigos] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    asignados: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/codigos/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const generar = async (e) => {
    e.preventDefault();

    let cantidadFinal;
    let parametros = {};

    if (modoGeneracion === "cantidad") {
      if (cantidad <= 0 || cantidad > 1000) {
        alert("La cantidad debe ser entre 1 y 1000");
        return;
      }
      cantidadFinal = cantidad;
      parametros = { cantidad: parseInt(cantidad) };
    } else {
      // Modo rango
      if (!rangoInicio || !rangoFin) {
        alert("Ingrese ambos números del rango");
        return;
      }

      const inicio = parseInt(rangoInicio);
      const fin = parseInt(rangoFin);

      if (inicio > fin) {
        alert("El número inicial debe ser menor que el final");
        return;
      }

      if (fin - inicio + 1 > 1000) {
        alert("El rango no puede exceder 1000 códigos");
        return;
      }

      cantidadFinal = fin - inicio + 1;
      parametros = {
        rangoInicio: inicio,
        rangoFin: fin,
      };
    }

    setGenerando(true);
    try {
      const endpoint =
        modoGeneracion === "cantidad"
          ? "http://localhost:4000/api/codigos/generar"
          : "http://localhost:4000/api/codigos/generar-rango";

      const res = await axios.post(endpoint, parametros);

      setCodigosGenerados(res.data.codigos);
      setMostrarCodigos(true);
      cargarEstadisticas();
      alert(`✅ ${cantidadFinal} códigos generados exitosamente!`);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Error al generar códigos");
      }
    } finally {
      setGenerando(false);
    }
  };

  const imprimirTodos = () => {
    const ventanaImprimir = window.open("", "_blank");

    let contenidoHTML = `
      <html>
        <head>
          <title>Etiquetas de Códigos de Barras</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .etiqueta { 
              display: inline-block; 
              margin: 10px; 
              padding: 10px; 
              border: 1px solid #ccc; 
              text-align: center;
              page-break-inside: avoid;
              width: 200px;
            }
            .codigo { font-weight: bold; margin: 5px 0; }
            img { margin: 5px 0; }
            @media print {
              .etiqueta { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Etiquetas Generadas - ${new Date().toLocaleDateString()}</h1>
    `;

    codigosGenerados.forEach((codigo) => {
      contenidoHTML += `
        <div class="etiqueta">
          <div class="codigo">${codigo.codigo}</div>
          <img src="http://localhost:4000/api/barcode/${codigo.codigo}" alt="${codigo.codigo}" />
          <div style="font-size: 12px;">Inventario</div>
        </div>
      `;
    });

    contenidoHTML += `
        </body>
      </html>
    `;

    ventanaImprimir.document.write(contenidoHTML);
    ventanaImprimir.document.close();
    ventanaImprimir.print();
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">🏷️ Generar Etiquetas de Códigos</h2>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <strong>📊 Estado actual:</strong> {stats.total} códigos totales
                |{stats.disponibles} disponibles | {stats.asignados} asignados
              </div>

              <p className="text-muted mb-4">
                Genera códigos de barras vacíos para imprimir y pegar en tus
                productos. Después podrás escanearlos para asignar la
                información.
              </p>

              <form onSubmit={generar}>
                {/* Selector de modo */}
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="modoGeneracion"
                        id="modoCantidad"
                        checked={modoGeneracion === "cantidad"}
                        onChange={() => setModoGeneracion("cantidad")}
                      />
                      <label
                        className="btn btn-outline-primary"
                        htmlFor="modoCantidad"
                      >
                        Por Cantidad
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="modoGeneracion"
                        id="modoRango"
                        checked={modoGeneracion === "rango"}
                        onChange={() => setModoGeneracion("rango")}
                      />
                      <label
                        className="btn btn-outline-primary"
                        htmlFor="modoRango"
                      >
                        Por Rango Específico
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row align-items-end">
                  {modoGeneracion === "cantidad" ? (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Cantidad de etiquetas:
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value))}
                        min="1"
                        max="1000"
                        required
                      />
                      <div className="form-text">
                        Se generarán consecutivos automáticamente
                      </div>
                    </div>
                  ) : (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Rango específico:
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Del #"
                          value={rangoInicio}
                          onChange={(e) => setRangoInicio(e.target.value)}
                          min="1"
                          required
                        />
                        <span className="input-group-text">al</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Al #"
                          value={rangoFin}
                          onChange={(e) => setRangoFin(e.target.value)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="form-text">
                        Ejemplo: Del 50 al 100 (generará 51 códigos)
                      </div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <button
                      type="submit"
                      disabled={generando}
                      className="btn btn-success btn-lg w-100"
                    >
                      {generando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Generando...
                        </>
                      ) : (
                        "Generar Códigos"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Códigos generados */}
          {mostrarCodigos && codigosGenerados.length > 0 && (
            <div className="card shadow mt-4">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  ✅ Códigos Generados ({codigosGenerados.length})
                </h4>
                <div>
                  <button
                    onClick={imprimirTodos}
                    className="btn btn-light btn-sm me-2"
                  >
                    🖨️ Imprimir Todo
                  </button>
                  <button
                    onClick={() => setMostrarCodigos(false)}
                    className="btn btn-outline-light btn-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  {codigosGenerados.slice(0, 12).map((codigo) => (
                    <div key={codigo._id} className="col-md-4 col-sm-6 mb-3">
                      <div className="border rounded p-3 text-center bg-light">
                        <div className="fw-bold mb-2 small">
                          {codigo.codigo}
                        </div>
                        <img
                          src={`http://localhost:4000/api/barcode/${codigo.codigo}`}
                          alt={codigo.codigo}
                          className="img-fluid"
                          style={{ maxWidth: "150px" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {codigosGenerados.length > 12 && (
                  <div className="alert alert-info">
                    <strong>Mostrando los primeros 12 códigos.</strong>
                    Usa "Imprimir Todo" para ver todos los{" "}
                    {codigosGenerados.length} códigos generados.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
