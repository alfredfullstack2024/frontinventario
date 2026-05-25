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
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },

    locator: {
      patchSize: "large",
      halfSample: false,
    },

    numOfWorkers: navigator.hardwareConcurrency || 4,

    decoder: {
      readers: [
        "code_128_reader",
        "ean_reader",
        "ean_8_reader",
        "code_39_reader",
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
  console.log("Detectado:", data);

  if (detectedRef.current) return;

  const codigo = data?.codeResult?.code;

  if (!codigo) return;

  detectedRef.current = true;

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
      ref={scannerRef}
      style={{
        width: "100%",
        height: "300px",
      }}
    />
  );
}
