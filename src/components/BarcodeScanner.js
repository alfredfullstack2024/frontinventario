import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);

  useEffect(() => {
    alert("Componente BarcodeScanner cargado");

    const codeReader = new BrowserMultiFormatReader();

    let controls = null;

    const iniciarScanner = async () => {
      try {
        alert("Iniciando cámara...");

        controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, error) => {
            if (result) {
              const codigo = result.getText();

              console.log("Código leído:", codigo);

              alert(`Código leído: ${codigo}`);

              onDetected(codigo);

              controls?.stop();
            }

            if (error) {
              console.log("ZXing error:", error);
            }
          }
        );

        alert("ZXing iniciado correctamente");
      } catch (err) {
        console.error("Error iniciando cámara:", err);
        alert(`Error iniciando cámara: ${err.message}`);
      }
    };

    iniciarScanner();

    return () => {
      controls?.stop();
      codeReader.reset();
    };
  }, [onDetected]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
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
