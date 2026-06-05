import { useEffect, useState } from "react";
import axios from "axios";

export default function Productos() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productos, setProductos] = useState([]);
  const [productosCreados, setProductosCreados] = useState([]);
  const [mostrarCodigos, setMostrarCodigos] = useState(false);

  // Cargar las categorías disponibles
  const cargarCategorias = async () => {
    try {
      const res = await axios.get("https://backinventario-wns5.onrender.com/api/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // Cargar el reporte de productos por categoría
  const cargarProductos = async () => {
    try {
      const res = await axios.get("https://backinventario-wns5.onrender.com/api/reporte");
      setProductos(res.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProductos([]);
    }
  };

  // Crear productos y mostrar códigos generados
  const crear = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !categoria || cantidad <= 0) return;

    try {
      const res = await axios.post("http://localhost:4000/api/productos", {
        nombre,
        categoria,
        cantidad,
      });

      setProductosCreados(res.data);
      setMostrarCodigos(true);
      setNombre("");
      setCantidad(1);
      setCategoria("");
      cargarProductos();
    } catch (error) {
      console.error("Error al crear productos:", error);
      alert("Error al crear productos");
    }
  };

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Productos</h2>

      <form onSubmit={crear} className="mb-4">
        <input
          className="border p-2 mr-2"
          placeholder="Nombre base del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <select
          className="border p-2 mr-2"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">Seleccione categoría</option>
          {categorias.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 mr-2"
          value={cantidad}
          min={1}
          max={100}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Crear
        </button>
      </form>

      {/* Mostrar códigos de barras generados */}
      {mostrarCodigos && productosCreados.length > 0 && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Productos creados - Códigos de barras:
            </h3>
            <button
              onClick={() => setMostrarCodigos(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosCreados.map((prod) => (
              <div
                key={prod._id}
                className="border p-3 text-center bg-white rounded"
              >
                <p className="font-semibold mb-2">{prod.nombre}</p>
                <p className="text-sm text-gray-600 mb-2">{prod.codigo}</p>
                <img
                  src={`http://localhost:4000/api/productos/${prod.codigo}/barcode`}
                  alt={`Código ${prod.codigo}`}
                  className="mx-auto border"
                />
                <button
                  onClick={() =>
                    window.open(
                      `http://localhost:4000/api/productos/${prod.codigo}/barcode`
                    )
                  }
                  className="mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Imprimir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">Resumen por categoría</h3>
      {productos.length > 0 ? (
        <ul>
          {productos.map((p, index) => (
            <li key={p._id || index} className="border-b py-1">
              <strong>Categoría ID {p._id}:</strong> {p.total} productos
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay productos creados aún</p>
      )}
    </div>
  );
}
