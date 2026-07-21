import { useStrokeDrawing } from "@/hooks/useStrokeDrawing";
import { ImageTransform } from "@/store/useDoctorNotesStore";
import { ReportAnnotationStroke, ReportAnnotationTool } from "@/store/useVisitReportsStore";
import Konva from "konva";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Rect, Stage, Transformer } from "react-konva";
import useImage from "use-image";
import AnnotationStrokesLayer from "./AnnotationStrokesLayer";

export interface DoctorWorkspaceCanvasHandle {
  applyCrop: () => void;
  cancelCrop: () => void;
}

interface DoctorWorkspaceCanvasProps {
  src: string | null;
  imageTransform: ImageTransform;
  onImageTransformChange: (transform: ImageTransform) => void;
  strokes: ReportAnnotationStroke[];
  onStrokesChange: (strokes: ReportAnnotationStroke[]) => void;
  tool: ReportAnnotationTool;
  color: string;
  strokeWidth: number;
  cropMode: boolean;
  moveMode: boolean;
  onCropSelectionChange: (hasSelection: boolean) => void;
  onImageChange: (dataUrl: string) => void;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 700;
const MIN_CROP_SIZE = 6;

const DoctorWorkspaceCanvas = forwardRef<DoctorWorkspaceCanvasHandle, DoctorWorkspaceCanvasProps>(
  (
    {
      src,
      imageTransform,
      onImageTransformChange,
      strokes,
      onStrokesChange,
      tool,
      color,
      strokeWidth,
      cropMode,
      moveMode,
      onCropSelectionChange,
      onImageChange,
    },
    ref
  ) => {
    const [image] = useImage(src ?? "");
    const stageRef = useRef<Konva.Stage | null>(null);
    const imageNodeRef = useRef<Konva.Image | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const isCroppingRef = useRef(false);
    const [cropRect, setCropRect] = useState<CropRect | null>(null);

    const onImageTransformChangeRef = useRef(onImageTransformChange);
    onImageTransformChangeRef.current = onImageTransformChange;
    const fittedSrcRef = useRef<string | null>(null);

    const { handlePointerDown, handlePointerMove, handlePointerUp, renderedStrokes } =
      useStrokeDrawing({
        strokes,
        onStrokesChange,
        tool,
        color,
        strokeWidth,
      });

    useEffect(() => {
      if (!image || !src || fittedSrcRef.current === src) return;
      fittedSrcRef.current = src;
      const fitScale = Math.min(CANVAS_WIDTH / image.width, CANVAS_HEIGHT / image.height, 1);
      const w = image.width * fitScale;
      const h = image.height * fitScale;
      onImageTransformChangeRef.current({
        x: (CANVAS_WIDTH - w) / 2,
        y: (CANVAS_HEIGHT - h) / 2,
        scaleX: fitScale,
        scaleY: fitScale,
      });
    }, [image, src]);

    useEffect(() => {
      if (!moveMode || !transformerRef.current || !imageNodeRef.current) return;
      transformerRef.current.nodes([imageNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }, [moveMode, image]);

    const getPointerPosition = (stage: Konva.Stage | null) =>
      stage?.getRelativePointerPosition() ?? null;

    const handleStagePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (moveMode) return;
      if (!cropMode) {
        handlePointerDown(e);
        return;
      }
      const pos = getPointerPosition(e.target.getStage());
      if (!pos) return;
      isCroppingRef.current = true;
      setCropRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    };

    const handleStagePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (moveMode) return;
      if (!cropMode) {
        handlePointerMove(e);
        return;
      }
      if (!isCroppingRef.current) return;
      const pos = getPointerPosition(e.target.getStage());
      if (!pos) return;
      setCropRect(prev =>
        prev ? { x: prev.x, y: prev.y, width: pos.x - prev.x, height: pos.y - prev.y } : prev
      );
    };

    const handleStagePointerUp = () => {
      if (moveMode) return;
      if (!cropMode) {
        handlePointerUp();
        return;
      }
      isCroppingRef.current = false;
      setCropRect(prev => {
        const hasSelection =
          !!prev && Math.abs(prev.width) > MIN_CROP_SIZE && Math.abs(prev.height) > MIN_CROP_SIZE;
        onCropSelectionChange(hasSelection);
        return prev;
      });
    };

    useEffect(() => {
      setCropRect(null);
      onCropSelectionChange(false);
    }, [cropMode, onCropSelectionChange]);

    useImperativeHandle(ref, () => ({
      applyCrop: () => {
        const stage = stageRef.current;
        if (!stage || !cropRect) return;
        const x = Math.min(cropRect.x, cropRect.x + cropRect.width);
        const y = Math.min(cropRect.y, cropRect.y + cropRect.height);
        const w = Math.abs(cropRect.width);
        const h = Math.abs(cropRect.height);
        if (w < MIN_CROP_SIZE || h < MIN_CROP_SIZE) return;
        const dataUrl = stage.toDataURL({ x, y, width: w, height: h, pixelRatio: 1 });
        onImageChange(dataUrl);
        setCropRect(null);
        onCropSelectionChange(false);
      },
      cancelCrop: () => {
        setCropRect(null);
        onCropSelectionChange(false);
      },
    }));

    const displayCropRect = cropRect
      ? {
          x: Math.min(cropRect.x, cropRect.x + cropRect.width),
          y: Math.min(cropRect.y, cropRect.y + cropRect.height),
          width: Math.abs(cropRect.width),
          height: Math.abs(cropRect.height),
        }
      : null;

    return (
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerLeave={handleStagePointerUp}
        className={`rounded-lg shadow-sm bg-white touch-none ${cropMode ? "cursor-crosshair" : ""} ${moveMode ? "cursor-move" : ""}`}
      >
        <Layer listening={false}>
          <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" />
        </Layer>
        <Layer listening={moveMode}>
          {image && (
            <KonvaImage
              ref={imageNodeRef}
              image={image}
              x={imageTransform.x}
              y={imageTransform.y}
              scaleX={imageTransform.scaleX}
              scaleY={imageTransform.scaleY}
              width={image.width}
              height={image.height}
              draggable={moveMode}
              onDragEnd={() => {
                const node = imageNodeRef.current;
                if (!node) return;
                onImageTransformChange({ ...imageTransform, x: node.x(), y: node.y() });
              }}
              onTransformEnd={() => {
                const node = imageNodeRef.current;
                if (!node) return;
                onImageTransformChange({
                  x: node.x(),
                  y: node.y(),
                  scaleX: node.scaleX(),
                  scaleY: node.scaleY(),
                });
              }}
            />
          )}
          {moveMode && image && (
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
              }
            />
          )}
        </Layer>
        <Layer listening={!moveMode}>
          <AnnotationStrokesLayer strokes={renderedStrokes} />
        </Layer>
        {displayCropRect && (
          <Layer listening={false}>
            <Rect
              x={displayCropRect.x}
              y={displayCropRect.y}
              width={displayCropRect.width}
              height={displayCropRect.height}
              stroke="#0d9488"
              strokeWidth={1.5}
              dash={[6, 4]}
              fill="rgba(13,148,136,0.12)"
            />
          </Layer>
        )}
      </Stage>
    );
  }
);

DoctorWorkspaceCanvas.displayName = "DoctorWorkspaceCanvas";

export default DoctorWorkspaceCanvas;
