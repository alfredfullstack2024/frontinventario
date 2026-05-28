import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const yaDetectado = useRef(false);
  const controlsRef = useRef(null);
  const codeReaderRef = useRef(null);

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
              console.log("Código leído:", codigo);
              // Detener ANTES de llamar onDetected para evitar
              // que el cleanup lo intente detener de nuevo
              try { controlsRef.current?.stop(); } catch(e) {}
              onDetected(codigo);
            }
          }
        );
      } catch (err) {
        console.error("Error iniciando cámara:", err);
      }
    };

    iniciarScanner();

    return () => {
      // Cleanup seguro — nunca lanza error a React
      try { controlsRef.current?.stop(); } catch(e) {}
      try { codeReaderRef.current?.reset(); } catch(e) {}
    };
  }, []); // eslint-disable-line

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
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
    </div>
  );
}
