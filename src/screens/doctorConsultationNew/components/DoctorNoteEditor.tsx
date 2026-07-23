import { ANNOTATION_STROKE_COLORS, ANNOTATION_TOOLS } from "@/config/annotationTools";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  DEFAULT_IMAGE_TRANSFORM,
  DoctorNoteEntry,
  ImageTransform,
  useDoctorNotesStore,
} from "@/store/useDoctorNotesStore";
import { ReportAnnotationStroke, ReportAnnotationTool } from "@/store/useVisitReportsStore";
import { showSuccess, showWarning } from "@/utils/alert";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Crop,
  Eraser,
  Highlighter,
  ImageOff,
  Italic,
  Link2,
  List,
  ListOrdered,
  Move,
  Palette,
  PenLine,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DoctorWorkspaceCanvas, { DoctorWorkspaceCanvasHandle } from "./DoctorWorkspaceCanvas";

interface DoctorNoteEditorProps {
  patientId?: number;
  visitId?: number;
}

type EditorMode = "write" | "draw";
type WorkspaceMode = "draw" | "crop" | "move";

interface WorkspaceSnapshot {
  imageSrc: string | null;
  imageTransform: ImageTransform;
  strokes: ReportAnnotationStroke[];
}

const MAX_HISTORY = 50;

const TEXT_COLORS = ["#111827", "#ef4444", "#f97316", "#2563eb", "#16a34a", "#7c3aed"];
const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];
const FONT_FAMILIES = ["Inter", "Arial", "Georgia", "Times New Roman", "Courier New", "Verdana"];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px"];
const HEADING_OPTIONS = [
  { label: "Normal", value: "paragraph" },
  { label: "Heading 1", value: "1" },
  { label: "Heading 2", value: "2" },
  { label: "Heading 3", value: "3" },
];
const ALIGN_OPTIONS = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
  { value: "justify", icon: AlignJustify, label: "Justify" },
] as const;

const usePopover = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return { open, setOpen, ref };
};

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
      active ? "bg-teal-100 text-teal-600" : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);

const IconPopover = ({
  trigger,
  title,
  children,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) => {
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="relative" ref={ref}>
      <ToolbarButton onClick={() => setOpen(o => !o)} active={open} title={title}>
        {trigger}
      </ToolbarButton>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 flex gap-1 z-20"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const ToolbarDropdown = ({
  value,
  options,
  onSelect,
  width = "w-28",
  placeholder,
}: {
  value: string;
  options: { label: string; value: string; style?: CSSProperties }[];
  onSelect: (value: string) => void;
  width?: string;
  placeholder?: string;
}) => {
  const { open, setOpen, ref } = usePopover();
  const current = options.find(o => o.value === value)?.label ?? placeholder ?? options[0]?.label;

  return (
    <div className={`relative ${width} shrink-0`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-8 w-full px-2.5 rounded-lg flex items-center justify-between gap-1 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white transition-colors"
      >
        <span className="truncate">{current}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-full w-max max-h-56 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              style={opt.style}
              className={`w-full text-left px-3 py-1.5 text-xs whitespace-nowrap hover:bg-slate-50 ${
                opt.value === value ? "text-teal-600 font-semibold bg-teal-50/60" : "text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DoctorNoteEditor = ({ patientId, visitId }: DoctorNoteEditorProps) => {
  const getNote = useDoctorNotesStore(state => state.getNote);
  const saveNote = useDoctorNotesStore(state => state.saveNote);
  const { fetchApi } = useGlobalApi();
  const [isDirty, setIsDirty] = useState(false);
  const [mode, setMode] = useState<EditorMode>("write");
  const [strokes, setStrokes] = useState<ReportAnnotationStroke[]>([]);
  const [drawImageSrc, setDrawImageSrc] = useState<string | null>(null);
  const [imageTransform, setImageTransform] = useState<ImageTransform>(DEFAULT_IMAGE_TRANSFORM);
  const [drawTool, setDrawTool] = useState<ReportAnnotationTool>("pen");
  const [drawColor, setDrawColor] = useState(ANNOTATION_STROKE_COLORS[0]);
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(4);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("draw");
  const [hasCropSelection, setHasCropSelection] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const workspaceRef = useRef<DoctorWorkspaceCanvasHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;
  const historyRef = useRef<WorkspaceSnapshot[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    onUpdate: () => setIsDirty(true),
    editorProps: {
      attributes: {
        class: "doctor-note-content min-h-full px-6 py-4 text-sm text-slate-700 focus:outline-none",
      },
    },
  });

  const applyNote = useCallback(
    (editorInstance: NonNullable<typeof editor>, note: DoctorNoteEntry | undefined) => {
      editorInstance.commands.setContent(note?.content ?? "");
      setStrokes(note?.strokes ?? []);
      setDrawImageSrc(note?.imageSrc ?? null);
      setImageTransform(note?.imageTransform ?? DEFAULT_IMAGE_TRANSFORM);
      setIsDirty(false);
      historyRef.current = [];
      setCanUndo(false);
    },
    []
  );

  const pushHistory = () => {
    historyRef.current = [
      ...historyRef.current,
      { imageSrc: drawImageSrc, imageTransform, strokes },
    ].slice(-MAX_HISTORY);
    setCanUndo(true);
  };

  const applyNewWorkspaceImage = (dataUrl: string) => {
    pushHistory();
    setDrawImageSrc(dataUrl);
    setImageTransform(DEFAULT_IMAGE_TRANSFORM);
    setStrokes([]);
    setIsDirty(true);
  };

  const applyNewWorkspaceImageRef = useRef(applyNewWorkspaceImage);
  applyNewWorkspaceImageRef.current = applyNewWorkspaceImage;

  useEffect(() => {
    if (!editor || patientId == null || visitId == null) return;
    applyNote(editor, getNote(patientId, visitId));

    let cancelled = false;
    fetchApiRef
      .current<{
        result: boolean;
        data: DoctorNoteEntry | null;
      }>(
        "GET",
        ENDPOINTS.GET_DOCTOR_VISIT_NOTE,
        {},
        { params: { patientId, visitId } },
        { component: "DoctorNoteEditor", silent: true }
      )
      .then(res => {
        if (cancelled || !res?.result || !res.data) return;
        applyNote(editor, res.data);
      });

    return () => {
      cancelled = true;
    };
  }, [editor, patientId, visitId, getNote, applyNote]);

  useEffect(() => {
    if (mode !== "draw") return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageItem = Array.from(items).find(item => item.type.startsWith("image/"));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (!file) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") applyNewWorkspaceImageRef.current(dataUrl);
      };
      reader.readAsDataURL(file);
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [mode]);

  if (!editor) return null;

  const handleSave = async () => {
    if (patientId == null || visitId == null) return;
    saveNote(patientId, visitId, editor.getHTML(), drawImageSrc, imageTransform, strokes);
    setIsDirty(false);

    const entry: DoctorNoteEntry = {
      patientId,
      visitId,
      content: editor.getHTML(),
      imageSrc: drawImageSrc,
      imageTransform,
      strokes,
      updatedOn: new Date().toISOString(),
    };
    const res = await fetchApi<{ result: boolean; message?: string }>(
      "POST",
      ENDPOINTS.SAVE_DOCTOR_VISIT_NOTE,
      entry,
      {},
      { component: "DoctorNoteEditor", silent: true }
    );
    if (res?.result) showSuccess("Note saved");
    else showWarning("Saved locally — syncing to server failed, will retry on next save");
  };

  const handleUndo = () => {
    const snapshot = historyRef.current[historyRef.current.length - 1];
    if (!snapshot) return;
    historyRef.current = historyRef.current.slice(0, -1);
    setCanUndo(historyRef.current.length > 0);
    setDrawImageSrc(snapshot.imageSrc);
    setImageTransform(snapshot.imageTransform);
    setStrokes(snapshot.strokes);
    setIsDirty(true);
  };

  const handleStrokesChange = (next: ReportAnnotationStroke[]) => {
    pushHistory();
    setStrokes(next);
    setIsDirty(true);
  };

  const handleImageTransformChange = (transform: ImageTransform) => {
    setImageTransform(transform);
    setIsDirty(true);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === "string") applyNewWorkspaceImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    pushHistory();
    setDrawImageSrc(null);
    setIsDirty(true);
  };

  const handleApplyCrop = () => {
    workspaceRef.current?.applyCrop();
    setWorkspaceMode("draw");
  };

  const handleCancelCrop = () => {
    workspaceRef.current?.cancelCrop();
    setWorkspaceMode("draw");
  };

  const setHeading = (value: string) => {
    if (value === "paragraph") editor.chain().focus().setParagraph().run();
    else
      editor
        .chain()
        .focus()
        .toggleHeading({ level: Number(value) as 1 | 2 | 3 })
        .run();
  };

  const applyLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : "paragraph";

  const activeAlign =
    ALIGN_OPTIONS.find(a => editor.isActive({ textAlign: a.value })) ?? ALIGN_OPTIONS[0];
  const ActiveAlignIcon = activeAlign.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === "write"
                ? "bg-white text-teal-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Type size={13} />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === "draw"
                ? "bg-white text-teal-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <PenLine size={13} />
            Draw
          </button>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className="save-btn !py-1.5 !text-xs flex items-center gap-1.5 disabled:opacity-40"
        >
          <Save size={14} />
          Save
        </button>
      </div>

      {mode === "write" ? (
        <>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-white flex-wrap shrink-0">
            <ToolbarDropdown value={headingValue} options={HEADING_OPTIONS} onSelect={setHeading} />

            <ToolbarDropdown
              value=""
              width="w-32"
              placeholder="Font"
              options={FONT_FAMILIES.map(font => ({
                label: font,
                value: font,
                style: { fontFamily: font },
              }))}
              onSelect={value => editor.chain().focus().setFontFamily(value).run()}
            />

            <ToolbarDropdown
              value=""
              width="w-16"
              placeholder="Size"
              options={FONT_SIZES.map(size => ({ label: size.replace("px", ""), value: size }))}
              onSelect={value => editor.chain().focus().setFontSize(value).run()}
            />

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={15} />
            </ToolbarButton>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <IconPopover trigger={<Palette size={15} />} title="Text color">
              {TEXT_COLORS.map(swatch => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => editor.chain().focus().setColor(swatch).run()}
                  className="w-5 h-5 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </IconPopover>

            <IconPopover trigger={<Highlighter size={15} />} title="Highlight">
              {HIGHLIGHT_COLORS.map(swatch => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => editor.chain().focus().toggleHighlight({ color: swatch }).run()}
                  className="w-5 h-5 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </IconPopover>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <IconPopover trigger={<ActiveAlignIcon size={15} />} title="Alignment">
              {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign(value).run()}
                  title={label}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeAlign.value === value
                      ? "bg-teal-100 text-teal-600"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </IconPopover>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet list"
            >
              <List size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Numbered list"
            >
              <ListOrdered size={15} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton onClick={applyLink} active={editor.isActive("link")} title="Link">
              <Link2 size={15} />
            </ToolbarButton>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              title="Clear formatting"
            >
              <Eraser size={15} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
              <Undo2 size={15} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
              <Redo2 size={15} />
            </ToolbarButton>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <EditorContent editor={editor} className="h-full" />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-white flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white transition-colors"
            >
              <Upload size={13} />
              Import Image
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <ToolbarButton
              onClick={() => setWorkspaceMode(prev => (prev === "move" ? "draw" : "move"))}
              active={workspaceMode === "move"}
              title="Move / resize image"
            >
              <Move size={15} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setWorkspaceMode(prev => (prev === "crop" ? "draw" : "crop"))}
              active={workspaceMode === "crop"}
              title="Crop image"
            >
              <Crop size={15} />
            </ToolbarButton>

            {workspaceMode === "crop" && (
              <>
                <ToolbarButton
                  onClick={handleApplyCrop}
                  title={
                    hasCropSelection ? "Apply crop" : "Drag on the image to select a crop area"
                  }
                >
                  <Check
                    size={15}
                    className={hasCropSelection ? "text-teal-600" : "text-slate-300"}
                  />
                </ToolbarButton>
                <ToolbarButton onClick={handleCancelCrop} title="Cancel crop">
                  <X size={15} />
                </ToolbarButton>
              </>
            )}

            {drawImageSrc && workspaceMode === "draw" && (
              <ToolbarButton onClick={handleRemoveImage} title="Remove image">
                <ImageOff size={15} />
              </ToolbarButton>
            )}

            <ToolbarButton onClick={handleUndo} active={false} title="Undo">
              <Undo2 size={15} className={canUndo ? "" : "opacity-30"} />
            </ToolbarButton>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {ANNOTATION_TOOLS.map(({ id, label, icon: Icon }) => (
              <ToolbarButton
                key={id}
                onClick={() => {
                  setWorkspaceMode("draw");
                  setDrawTool(id);
                }}
                active={workspaceMode === "draw" && drawTool === id}
                title={label}
              >
                <Icon size={15} />
              </ToolbarButton>
            ))}

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {ANNOTATION_STROKE_COLORS.map(swatch => (
              <button
                key={swatch}
                type="button"
                onClick={() => setDrawColor(swatch)}
                title={swatch}
                className={`w-6 h-6 rounded-full border-2 shadow-sm shrink-0 ${
                  drawColor === swatch ? "border-slate-700" : "border-white"
                }`}
                style={{ backgroundColor: swatch }}
              />
            ))}

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <input
              type="range"
              min={2}
              max={20}
              value={drawStrokeWidth}
              onChange={e => setDrawStrokeWidth(Number(e.target.value))}
              className="w-20 accent-teal-500"
              title="Stroke width"
            />

            <div className="flex-1" />

            <ToolbarButton onClick={() => handleStrokesChange([])} title="Clear strokes">
              <Trash2 size={15} />
            </ToolbarButton>
          </div>

          <div className="flex-1 overflow-auto bg-slate-100 p-6">
            <p className="text-center text-[11px] text-slate-400 mb-2">
              Import an image, or paste one with Ctrl+V
            </p>
            <div className="m-auto w-fit">
              <DoctorWorkspaceCanvas
                ref={workspaceRef}
                src={drawImageSrc}
                imageTransform={imageTransform}
                onImageTransformChange={handleImageTransformChange}
                strokes={strokes}
                onStrokesChange={handleStrokesChange}
                tool={drawTool}
                color={drawColor}
                strokeWidth={drawStrokeWidth}
                cropMode={workspaceMode === "crop"}
                moveMode={workspaceMode === "move"}
                onCropSelectionChange={setHasCropSelection}
                onImageChange={applyNewWorkspaceImage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorNoteEditor;
