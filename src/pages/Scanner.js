import { useState } from "react";
import axios from "axios";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState("");
  const [codigoManual, setCodigoManual] = useState("");

  const buscarProducto = async (codigo) => {
    try {
      setError("");
      const res = await axios.get(
        `https://backinventario-wns5.onrender.com/api/productos/${codigo}`
      );
      setProducto(res.data);
      setScanning(false);
    } catch (err) {
      setError("Producto no encontrado");
      setProducto(null);
    }
  };

  const handleDetected = (codigo) => {
    console.log("Código detectado:", codigo);
    buscarProducto(codigo);
  };

  const buscarManual = (e) => {
    e.preventDefault();
    if (codigoManual.trim()) {
      buscarProducto(codigoManual.trim());
      setCodigoManual("");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Escáner de Códigos de Barras</h2>

      {/* Botones de control */}
      <div className="mb-4">
        <button
          onClick={() => setScanning(!scanning)}
          className={`px-4 py-2 rounded mr-2 text-white ${
            scanning ? "bg-red-600" : "bg-blue-600"
          }`}
        >
          {scanning ? "Detener Escáner" : "Iniciar Escáner"}
        </button>
      </div>

      {/* Búsqueda manual */}
      <form onSubmit={buscarManual} className="mb-4">
        <input
          className="border p-2 mr-2"
          value={codigoManual}
          onChange={(e) => setCodigoManual(e.target.value)}
          placeholder="Ingrese código manualmente"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Buscar
        </button>
      </form>

      {/* Escáner */}
      {scanning && (
        <div className="mb-4">
          <p className="text-blue-600 mb-2">
            Apunte la cámara al código de barras
          </p>
          <BarcodeScanner onDetected={handleDetected} />
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Información del producto */}
      {producto && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h3 className="font-bold text-lg mb-2">Producto encontrado:</h3>
          <p>
            <strong>Nombre:</strong> {producto.nombre}
          </p>
          <p>
            <strong>Código:</strong> {producto.codigo}
          </p>
          <p>
            <strong>Categoría:</strong> {producto.categoria?.nombre}
          </p>

          {/* Mostrar código de barras */}
          <div className="mt-4">
            <p>
              <strong>Código de barras:</strong>
            </p>
            <img
              src={`https://backinventario-wns5.onrender.com/api/productos/${producto.codigo}/barcode`}
              alt={`Código de barras ${producto.codigo}`}
              className="mt-2 border"
            />
          </div>
        </div>
      )}
    </div>
  );
}
