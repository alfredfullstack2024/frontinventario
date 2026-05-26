import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    let controls = null;

    const iniciarScanner = async () => {
      try {
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
