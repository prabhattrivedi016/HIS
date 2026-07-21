import { ReportAnnotationStroke, ReportAnnotationTool } from "@/store/useVisitReportsStore";
import Konva from "konva";
import { useRef, useState } from "react";

const SHAPE_TOOLS = new Set<ReportAnnotationTool>(["rectangle", "ellipse", "line", "arrow"]);

interface UseStrokeDrawingArgs {
  strokes: ReportAnnotationStroke[];
  onStrokesChange: (strokes: ReportAnnotationStroke[]) => void;
  tool: ReportAnnotationTool;
  color: string;
  strokeWidth: number;
}

export const useStrokeDrawing = ({
  strokes,
  onStrokesChange,
  tool,
  color,
  strokeWidth,
}: UseStrokeDrawingArgs) => {
  const isDrawingRef = useRef(false);
  const [liveStroke, setLiveStroke] = useState<ReportAnnotationStroke | null>(null);

  const getPointerPosition = (stage: Konva.Stage | null) =>
    stage?.getRelativePointerPosition() ?? null;

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const pos = getPointerPosition(e.target.getStage());
    if (!pos) return;
    isDrawingRef.current = true;
    setLiveStroke({
      id: crypto.randomUUID(),
      tool,
      points: SHAPE_TOOLS.has(tool) ? [pos.x, pos.y, pos.x, pos.y] : [pos.x, pos.y],
      color,
      strokeWidth,
    });
  };

  const handlePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!isDrawingRef.current || !liveStroke) return;
    const pos = getPointerPosition(e.target.getStage());
    if (!pos) return;
    setLiveStroke(prev => {
      if (!prev) return prev;
      if (SHAPE_TOOLS.has(prev.tool)) {
        return { ...prev, points: [prev.points[0], prev.points[1], pos.x, pos.y] };
      }
      return { ...prev, points: [...prev.points, pos.x, pos.y] };
    });
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current && liveStroke) {
      const isValid = SHAPE_TOOLS.has(liveStroke.tool)
        ? Math.hypot(
            liveStroke.points[2] - liveStroke.points[0],
            liveStroke.points[3] - liveStroke.points[1]
          ) > 3
        : liveStroke.points.length > 2;
      if (isValid) onStrokesChange([...strokes, liveStroke]);
    }
    isDrawingRef.current = false;
    setLiveStroke(null);
  };

  const renderedStrokes = liveStroke ? [...strokes, liveStroke] : strokes;

  return { handlePointerDown, handlePointerMove, handlePointerUp, renderedStrokes };
};
