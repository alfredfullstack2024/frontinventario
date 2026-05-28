import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const yaDetectado = useRef(false);
  const controlsRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [mensaje, setMensaje] = useState("📷 Apunta al código de barras...");
  const [detectado, setDetectado] = useState(false);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    const iniciarScanner = async () => {
      try {
        controlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result && !yaDetectado.current) {
              yaDetectado.current = true;
              const codigo = result.getText().trim();
              setMensaje(`✅ Código detectado: ${codigo}`);
              setDetectado(true);
              try { controlsRef.current?.stop(); } catch(e) {}
              // Pequeño delay para que el usuario vea el mensaje
              setTimeout(() => onDetected(codigo), 600);
            }
          }
        );
      } catch (err) {
        console.error("Error iniciando cámara:", err);
        setMensaje("❌ Error iniciando cámara");
      }
    };

    iniciarScanner();

    return () => {
      try { controlsRef.current?.stop(); } catch(e) {}
      try { codeReaderRef.current?.reset(); } catch(e) {}
    };
  }, []); // eslint-disable-line

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      {/* Mensaje de estado */}
      <div style={{
        padding: "8px 12px",
        marginBottom: "8px",
        borderRadius: "6px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "14px",
        background: detectado ? "#d1fae5" : "#dbeafe",
        color: detectado ? "#065f46" : "#1e40af",
        border: `1px solid ${detectado ? "#6ee7b7" : "#93c5fd"}`,
      }}>
        {mensaje}
      </div>

      {/* Video — se oculta al detectar */}
      {!detectado && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            borderRadius: "10px",
            border: "2px solid #0d6efd",
          }}
        />
      )}

      {/* Pantalla de éxito al detectar */}
      {detectado && (
        <div style={{
          padding: "20px",
          textAlign: "center",
          fontSize: "48px",
        }}>
          ✅
          <p style={{ fontSize: "14px", color: "#065f46", marginTop: "8px" }}>
            Cargando formulario...
          </p>
        </div>
      )}
    </div>
  );
}
