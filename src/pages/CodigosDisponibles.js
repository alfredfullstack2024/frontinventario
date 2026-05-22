import { useState, useEffect } from "react";
import axios from "axios";

export default function CodigosDisponibles() {
  const [codigosDisponibles, setCodigosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionados, setSeleccionados] = useState([]);
  const [rangoInicio, setRangoInicio] = useState("");
  const [rangoFin, setRangoFin] = useState("");

  useEffect(() => {
    cargarCodigosDisponibles();
  }, []);

  const cargarCodigosDisponibles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://backinventario-wns5.onrender.com/api/codigos?estado=disponible&limit=500",
      );
      setCodigosDisponibles(res.data);
    } catch (error) {
      console.error("Error cargando códigos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccion = (codigoId) => {
    setSeleccionados((prev) =>
      prev.includes(codigoId)
        ? prev.filter((id) => id !== codigoId)
        : [...prev, codigoId],
    );
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === codigosDisponibles.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(codigosDisponibles.map((c) => c._id));
    }
  };

  const seleccionarPorRango = () => {
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

    const codigosEnRango = codigosDisponibles.filter((codigo) => {
      const match = codigo.codigo.match(/-(\d+)$/);
      if (match) {
        const numero = parseInt(match[1]);
        return numero >= inicio && numero <= fin;
      }
      return false;
    });

    setSeleccionados(codigosEnRango.map((c) => c._id));
  };

  const imprimirSeleccionados = () => {
    if (seleccionados.length === 0) {
      alert("Seleccione al menos un código para imprimir");
      return;
    }

    const codigosParaImprimir = codigosDisponibles.filter((c) =>
      seleccionados.includes(c._id),
    );

    const ventanaImprimir = window.open("", "_blank");

    let contenidoHTML = `
      <html>
        <head>
          <title>Códigos Seleccionados para Imprimir</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .etiqueta { 
              display: inline-block; 
              margin: 10px; 
              padding: 10px; 
              border: 2px solid #333; 
              text-align: center;
              page-break-inside: avoid;
              width: 200px;
              background: white;
            }
            .codigo { 
              font-weight: bold; 
              margin: 5px 0; 
              font-size: 14px;
            }
            img { 
  margin: 5px 0;
  width: 180px;
  height: 50px;
  object-fit: contain;
}
            .fecha { 
              font-size: 10px; 
              color: #666; 
            }
            @media print {
              .etiqueta { break-inside: avoid; margin: 5px; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Códigos para Imprimir - ${new Date().toLocaleDateString()}</h1>
          <p>Total: ${codigosParaImprimir.length} códigos</p>
    `;

    codigosParaImprimir.forEach((codigo) => {
      contenidoHTML += `
        <div class="etiqueta">
          <div class="codigo">${codigo.codigo}</div>
          <img src="http://localhost:4000/api/barcode/${codigo.codigo}" alt="${
            codigo.codigo
          }" />
          <div class="fecha">Generado: ${new Date(
            codigo.fechaGeneracion,
          ).toLocaleDateString()}</div>
        </div>
      `;
    });

    contenidoHTML += `
        </body>
      </html>
    `;

    ventanaImprimir.document.write(contenidoHTML);
    ventanaImprimir.document.close();

    ventanaImprimir.onload = () => {
      setTimeout(() => {
        ventanaImprimir.print();
      }, 1000);
    };
  };

  const extraerNumero = (codigo) => {
    const match = codigo.match(/-(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando códigos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h2 className="mb-0">📋 Códigos Disponibles para Imprimir</h2>
            </div>
            <div className="card-body">
              {/* Controles de selección */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <button
                    onClick={seleccionarTodos}
                    className="btn btn-outline-primary w-100"
                  >
                    {seleccionados.length === codigosDisponibles.length
                      ? "Deseleccionar Todos"
                      : "Seleccionar Todos"}
                  </button>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Del número"
                      value={rangoInicio}
                      onChange={(e) => setRangoInicio(e.target.value)}
                    />
                    <span className="input-group-text">al</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Al número"
                      value={rangoFin}
                      onChange={(e) => setRangoFin(e.target.value)}
                    />
                    <button
                      onClick={seleccionarPorRango}
                      className="btn btn-outline-success"
                    >
                      Seleccionar Rango
                    </button>
                  </div>
                  <small className="text-muted">
                    Ejemplo: Del 10 al 25 para seleccionar códigos que terminen
                    en esos números
                  </small>
                </div>
                <div className="col-md-2">
                  <button
                    onClick={imprimirSeleccionados}
                    className="btn btn-success w-100"
                    disabled={seleccionados.length === 0}
                  >
                    🖨️ Imprimir ({seleccionados.length})
                  </button>
                </div>
              </div>

              {/* Información */}
              <div className="alert alert-info">
                <strong>📊 Total:</strong> {codigosDisponibles.length} códigos
                disponibles sin asignar
              </div>

              {/* Lista de códigos */}
              {codigosDisponibles.length > 0 ? (
                <div className="row">
                  {codigosDisponibles.map((codigo) => (
                    <div
                      key={codigo._id}
                      className="col-lg-3 col-md-4 col-sm-6 mb-3"
                    >
                      <div
                        className={`card h-100 ${
                          seleccionados.includes(codigo._id)
                            ? "border-success"
                            : ""
                        }`}
                      >
                        <div className="card-body text-center p-2">
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={seleccionados.includes(codigo._id)}
                              onChange={() => toggleSeleccion(codigo._id)}
                            />
                            <label className="form-check-label fw-bold small">
                              #{extraerNumero(codigo.codigo)}
                            </label>
                          </div>
                          <div
                            className="small text-muted mb-2"
                            style={{ fontSize: "10px" }}
                          >
                            {codigo.codigo}
                          </div>
                          <img
                            src={`http://localhost:4000/api/barcode/${codigo.codigo}`}
                            alt={codigo.codigo}
                            className="img-fluid"
                            style={{ maxWidth: "120px", height: "auto" }}
                          />
                          <div
                            className="small text-muted mt-1"
                            style={{ fontSize: "9px" }}
                          >
                            {new Date(
                              codigo.fechaGeneracion,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <div className="display-1 mb-3">📭</div>
                  <h4>No hay códigos disponibles</h4>
                  <p>
                    Genere algunos códigos primero en la sección "Generar
                    Etiquetas"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
