import { useEffect, useRef } from "react";
import Quagga from "quagga";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);

  const detectedRef = useRef(false);

  useEffect(() => {
  detectedRef.current = false;

 Quagga.init(
  {
    inputStream: {
      type: "LiveStream",
      target: scannerRef.current,
      constraints: {
  facingMode: {
    ideal: "environment",
  },
},

    locator: {
  patchSize: "x-large",
  halfSample: false,
},

    numOfWorkers: 2,

   decoder: {
  readers: [
    "code_128_reader",
  ],
},

    locate: true,
  },

  (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("Scanner iniciado");
    Quagga.start();
  }
);
 const handleDetection = (data) => {
  alert("Detectó algo");

  console.log("Detectado:", data);

  if (detectedRef.current) return;

  const codigo = data?.codeResult?.code;

  if (!codigo) {
    alert("No encontró código");
    return;
  }

  detectedRef.current = true;

  alert(`Código leído: ${codigo}`);

  console.log("Código leído:", codigo);

  onDetected(codigo);
};
  Quagga.onDetected(handleDetection);

  return () => {
    Quagga.offDetected(handleDetection);
    Quagga.stop();
  };
}, [onDetected]);

  return (
  <div
    style={{
      position: "relative",
      width: "100%",
      maxWidth: "350px",
      margin: "0 auto",
    }}
  >
    <div
      ref={scannerRef}
      style={{
        width: "100%",
        height: "250px",
        overflow: "hidden",
        borderRadius: "10px",
      }}
    />

    <div
      style={{
        position: "absolute",
        left: "10%",
        top: "40%",
        width: "80%",
        height: "40px",
        border: "3px solid red",
        pointerEvents: "none",
      }}
    />
  </div>
);
}
