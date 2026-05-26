import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const onDetectedRef = useRef(onDetected);
  const yaDetectado = useRef(false);

  // Mantiene la referencia actualizada sin re-disparar el useEffect
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls = null;

    const iniciarScanner = async () => {
      try {
        controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, error) => {
            if (result && !yaDetectado.current) {
              yaDetectado.current = true; // bloquea inmediatamente
              const codigo = result.getText();
              console.log("Código leído:", codigo);
              controls?.stop();
              onDetectedRef.current(codigo); // usa ref, no prop directa
            }
          }
        );
      } catch (err) {
        console.error("Error iniciando cámara:", err);
      }
    };

    iniciarScanner();

    return () => {
      controls?.stop();
      codeReader.reset();
    };
  }, []); // ← array vacío, solo monta una vez

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
