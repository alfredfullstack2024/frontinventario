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
        },
      },
      decoder: {
        readers: ["code_128_reader", "ean_reader"],
      },
    },
    (err) => {
      if (err) {
        console.error(err);
        return;
      }

      Quagga.start();
    }
  );

  const handleDetection = (data) => {
    if (detectedRef.current) return;

    const codigo = data?.codeResult?.code;

    if (!codigo) return;

    detectedRef.current = true;

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
