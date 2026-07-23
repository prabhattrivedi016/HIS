import { useStrokeDrawing } from "@/hooks/useStrokeDrawing";
import { ReportAnnotationStroke, ReportAnnotationTool } from "@/store/useVisitReportsStore";
import Konva from "konva";
import { RefObject, useEffect } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import AnnotationStrokesLayer from "./AnnotationStrokesLayer";

interface ReportAnnotationCanvasProps {
  src: string;
  strokes: ReportAnnotationStroke[];
  onStrokesChange: (strokes: ReportAnnotationStroke[]) => void;
  tool: ReportAnnotationTool;
  color: string;
  strokeWidth: number;
  scale: number;
  stageRef?: RefObject<Konva.Stage | null>;
  onImageSize?: (size: { width: number; height: number }) => void;
}

const ReportAnnotationCanvas = ({
  src,
  strokes,
  onStrokesChange,
  tool,
  color,
  strokeWidth,
  scale,
  stageRef,
  onImageSize,
}: ReportAnnotationCanvasProps) => {
  const [image] = useImage(src);
  const { handlePointerDown, handlePointerMove, handlePointerUp, renderedStrokes } =
    useStrokeDrawing({
      strokes,
      onStrokesChange,
      tool,
      color,
      strokeWidth,
    });

  const naturalWidth = image?.width ?? 640;
  const naturalHeight = image?.height ?? 480;
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;

  useEffect(() => {
    if (image) onImageSize?.({ width: image.width, height: image.height });
  }, [image, onImageSize]);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="rounded-lg shadow-sm bg-white touch-none"
    >
      <Layer listening={false}>
        {image && <KonvaImage image={image} width={naturalWidth} height={naturalHeight} />}
      </Layer>
      <Layer>
        <AnnotationStrokesLayer strokes={renderedStrokes} />
      </Layer>
    </Stage>
  );
};

export default ReportAnnotationCanvas;
