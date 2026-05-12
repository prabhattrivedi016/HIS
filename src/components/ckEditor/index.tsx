import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useEffect, useRef } from "react";

type TextEditorProps = {
  value: string;
  onChange: (data: string) => void;
};

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentValue = editor.getData?.() ?? "";
    const nextValue = value ?? "";

    if (currentValue !== nextValue) {
      editor.setData(nextValue);
    }
  }, [value]);

  return (
    <div className="custom-ckeditor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onReady={editor => {
          editorRef.current = editor;
        }}
        onChange={(_, editor) => onChange(editor.getData())}
        config={{
          toolbar: {
            items: [
              // Document
              "undo",
              "redo",
              "|",

              // Headings & Styles
              "heading",
              "|",

              // Fonts
              "fontFamily",
              "fontSize",
              "fontColor",
              "fontBackgroundColor",
              "|",

              // Text styles
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "subscript",
              "superscript",
              "removeFormat",
              "|",

              // Lists
              "bulletedList",
              "numberedList",
              "todoList",
              "|",

              // Alignment & indent
              "alignment",
              "outdent",
              "indent",
              "|",

              // Links & media
              "link",
              "imageUpload",
              "mediaEmbed",
              "|",

              // Insert
              "insertTable",
              "blockQuote",
              "horizontalLine",
              "codeBlock",
              "|",

              // Utilities
              "findAndReplace",
              "selectAll",
              "specialCharacters",
            ],
            shouldNotGroupWhenFull: true,
          },

          heading: {
            options: [
              { model: "paragraph", title: "Paragraph" },
              { model: "heading1", view: "h1", title: "Heading 1" },
              { model: "heading2", view: "h2", title: "Heading 2" },
              { model: "heading3", view: "h3", title: "Heading 3" },
              { model: "heading4", view: "h4", title: "Heading 4" },
            ],
          },

          fontSize: {
            options: [9, 11, 13, "default", 17, 19, 21, 27, 35],
          },

          fontFamily: {
            options: [
              "default",
              "Arial, Helvetica, sans-serif",
              "Courier New, Courier, monospace",
              "Georgia, serif",
              "Times New Roman, Times, serif",
              "Verdana, Geneva, sans-serif",
            ],
          },

          alignment: {
            options: ["left", "center", "right", "justify"],
          },

          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableProperties",
              "tableCellProperties",
            ],
          },

          image: {
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
            ],
          },

          link: {
            decorators: {
              openInNewTab: {
                mode: "manual",
                label: "Open in new tab",
                attributes: {
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
            },
          },

          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
        }}
      />
    </div>
  );
};

export default TextEditor;
