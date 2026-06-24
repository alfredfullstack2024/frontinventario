import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
  "https://backinventario-wns5.onrender.com/api/auth/login",
  {
        email,
        password,
      });

      // Guardar token
     localStorage.setItem("token", res.data.token);

localStorage.setItem(
  "usuario",
  JSON.stringify(res.data.usuario)
);

alert("✅ Bienvenido");

window.location.href = "/";
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.error || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-header bg-dark text-white text-center">
              <h3 className="mb-0">🔐 Iniciar Sesión</h3>
            </div>

            <div className="card-body">
              <form onSubmit={iniciarSesion}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Correo</label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Contraseña</label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="btn btn-dark w-100" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
