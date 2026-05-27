import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const yaDetectado = useRef(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const iniciarScanner = async () => {
      try {
        videoRef.current?.setAttribute("playsinline", true);
        controlsRef.current = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, error) => {
           if (result && !yaDetectado.current) {

  yaDetectado.current = true;

  const codigo = result.getText().trim();

  console.log("Código leído:", codigo);

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
      controlsRef.current?.stop();
      codeReader.reset();
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
