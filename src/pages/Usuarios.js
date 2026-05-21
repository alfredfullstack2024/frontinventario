import { useEffect, useState } from "react";
import api from "../services/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "operador",
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");

      setUsuarios(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const crearUsuario = async (e) => {
    e.preventDefault();

    try {
      await api.post("/usuarios", formData);

      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "operador",
      });

      cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error);
    }
  };

  const cambiarEstado = async (id) => {
    try {
      await api.put(`/usuarios/${id}/estado`);

      cargarUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">👥 Gestión de Usuarios</h3>
        </div>

        <div className="card-body">
          <form onSubmit={crearUsuario} className="row g-3 mb-4">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={formData.rol}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rol: e.target.value,
                  })
                }
              >
                <option value="operador">Operador</option>

                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="col-md-2">
              <button className="btn btn-success w-100">
                ➕ Crear Usuario
              </button>
            </div>
          </form>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario._id}>
                  <td>{usuario.nombre}</td>

                  <td>{usuario.email}</td>

                  <td>
                    <span className="badge bg-warning text-dark">
                      {usuario.rol}
                    </span>
                  </td>

                  <td>
                    {usuario.activo ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-danger">Inactivo</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => cambiarEstado(usuario._id)}
                    >
                      {usuario.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
