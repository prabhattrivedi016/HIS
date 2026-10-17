import { Component, ReactNode } from "react";
import Barcode from "react-barcode";

class BarcodeErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export interface CustomBarcodeProps {
  value?: string | number | null;
  fallbackValue?: string | number | null;
  width?: number;
  height?: number;
  format?:
    | "CODE128"
    | "CODE128A"
    | "CODE128B"
    | "CODE128C"
    | "EAN13"
    | "UPC"
    | "EAN8"
    | "EAN5"
    | "EAN2"
    | "CODE39"
    | "ITF14"
    | "MSI"
    | "pharmacode"
    | "codabar";
  displayValue?: boolean;
  showText?: boolean;
  fontSize?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
  className?: string;
  textClassName?: string;
}

const CustomBarcode = ({
  value,
  fallbackValue,
  width = 1,
  height = 20,
  format = "CODE128",
  displayValue = false,
  showText = false,
  fontSize = 10,
  margin = 2,
  background = "transparent",
  lineColor = "#1e293b",
  className = "",
  textClassName = "",
}: CustomBarcodeProps) => {
  const barcodeValue = (
    value && value !== "0" && value !== 0
      ? String(value)
      : fallbackValue && fallbackValue !== "0" && fallbackValue !== 0
        ? String(fallbackValue)
        : ""
  ).trim();

  if (!barcodeValue || barcodeValue === "0") {
    return <span className="text-gray-400 font-normal text-xs">-</span>;
  }

  return (
    <div className={`flex flex-col items-center justify-center m-auto p-1.5 ${className}`}>
      <BarcodeErrorBoundary
        fallback={
          <span className={`text-[11px] font-mono text-gray-700 font-semibold ${textClassName}`}>
            {barcodeValue}
          </span>
        }
      >
        <Barcode
          value={barcodeValue}
          format={format}
          width={width}
          height={height}
          displayValue={displayValue}
          margin={margin}
          background={background}
          lineColor={lineColor}
          fontSize={fontSize}
        />
      </BarcodeErrorBoundary>

      {showText && !displayValue && (
        <span
          className={`text-[10px] text-gray-700 font-mono font-bold tracking-tight mt-1 leading-none ${textClassName}`}
        >
          {barcodeValue}
        </span>
      )}
    </div>
  );
};

export const BarcodeDisplay = CustomBarcode;
export default CustomBarcode;
