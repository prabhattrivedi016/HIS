import { ReportAnnotationTool } from "@/store/useVisitReportsStore";
import { ArrowUpRight, Circle, Eraser, Minus, Pencil, Square } from "lucide-react";

export const ANNOTATION_TOOLS: { id: ReportAnnotationTool; label: string; icon: typeof Pencil }[] =
  [
    { id: "pen", label: "Pen", icon: Pencil },
    { id: "erase", label: "Eraser", icon: Eraser },
    { id: "rectangle", label: "Rectangle", icon: Square },
    { id: "ellipse", label: "Ellipse", icon: Circle },
    { id: "line", label: "Line", icon: Minus },
    { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  ];

export const ANNOTATION_STROKE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#2563eb",
  "#7c3aed",
  "#111827",
];
