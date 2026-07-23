import { ReportAnnotationStroke } from "@/store/useVisitReportsStore";
import { Arrow, Ellipse, Line, Rect } from "react-konva";

interface AnnotationStrokesLayerProps {
  strokes: ReportAnnotationStroke[];
}

const AnnotationStrokesLayer = ({ strokes }: AnnotationStrokesLayerProps) => (
  <>
    {strokes.map(stroke => {
      if (stroke.tool === "pen" || stroke.tool === "erase") {
        return (
          <Line
            key={stroke.id}
            points={stroke.points}
            stroke={stroke.color}
            strokeWidth={stroke.strokeWidth}
            tension={0.4}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={stroke.tool === "erase" ? "destination-out" : "source-over"}
          />
        );
      }
      if (stroke.tool === "rectangle") {
        const [x1, y1, x2, y2] = stroke.points;
        return (
          <Rect
            key={stroke.id}
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            stroke={stroke.color}
            strokeWidth={stroke.strokeWidth}
          />
        );
      }
      if (stroke.tool === "ellipse") {
        const [x1, y1, x2, y2] = stroke.points;
        return (
          <Ellipse
            key={stroke.id}
            x={(x1 + x2) / 2}
            y={(y1 + y2) / 2}
            radiusX={Math.abs(x2 - x1) / 2}
            radiusY={Math.abs(y2 - y1) / 2}
            stroke={stroke.color}
            strokeWidth={stroke.strokeWidth}
          />
        );
      }
      if (stroke.tool === "line") {
        return (
          <Line
            key={stroke.id}
            points={stroke.points}
            stroke={stroke.color}
            strokeWidth={stroke.strokeWidth}
            lineCap="round"
          />
        );
      }
      return (
        <Arrow
          key={stroke.id}
          points={stroke.points}
          stroke={stroke.color}
          fill={stroke.color}
          strokeWidth={stroke.strokeWidth}
          pointerLength={10}
          pointerWidth={10}
        />
      );
    })}
  </>
);

export default AnnotationStrokesLayer;
