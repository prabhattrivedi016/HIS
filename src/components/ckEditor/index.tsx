import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  CodeBlock,
  Essentials,
  FindAndReplace,
  Font,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SimpleUploadAdapter,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  Underline,
  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

type TextEditorProps = {
  value: string;
  onChange: (data: string) => void;
};

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  return (
    <div className="custom-ckeditor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(_, editor) => {
          const data = editor.getData();

          console.log("CKEditor Data:", data);

          onChange(data);
        }}
        config={{
          licenseKey: "GPL",

          plugins: [
            Essentials,
            Paragraph,
            Heading,

            // Text formatting
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Subscript,
            Superscript,
            RemoveFormat,

            // Font
            Font,

            // Alignment
            Alignment,

            // Lists
            List,

            // Indentation
            Indent,

            // Links
            Link,

            // Block
            BlockQuote,
            HorizontalLine,
            CodeBlock,

            // Tables
            Table,
            TableToolbar,
            TableProperties,
            TableCellProperties,

            // Images
            Image,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,
            ImageUpload,

            // IMPORTANT: Image upload adapter
            SimpleUploadAdapter,

            // Media
            MediaEmbed,

            // Utilities
            FindAndReplace,
            SelectAll,
            SpecialCharacters,
            SpecialCharactersEssentials,

            // Undo / Redo
            Undo,

            // Paste from Word / Office
            PasteFromOffice,
          ],

          // =====================================================
          // IMAGE UPLOAD CONFIGURATION
          // =====================================================
          simpleUpload: {
            uploadUrl: "YOUR_IMAGE_UPLOAD_API",

            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },

          //  toolbar
          toolbar: {
            items: [
              "undo",
              "redo",
              "|",

              "heading",
              "|",

              "fontFamily",
              "fontSize",
              "fontColor",
              "fontBackgroundColor",
              "|",

              "bold",
              "italic",
              "underline",
              "strikethrough",
              "subscript",
              "superscript",
              "removeFormat",
              "|",

              "bulletedList",
              "numberedList",
              "todoList",
              "|",

              "outdent",
              "indent",
              "alignment",
              "|",

              "link",
              "uploadImage",
              "mediaEmbed",
              "|",

              "insertTable",
              "blockQuote",
              "horizontalLine",
              "codeBlock",
              "|",

              "findAndReplace",
              "selectAll",
              "specialCharacters",
            ],

            shouldNotGroupWhenFull: true,
          },

          // heading
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
            ],
          },

          // =====================================================
          // FONT SIZE
          // font size
          fontSize: {
            options: [9, 11, 13, "default", 17, 19, 21, 27, 35],
          },

          // font family
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

          // alignment
          alignment: {
            options: ["left", "center", "right", "justify"],
          },

          // table
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableProperties",
              "tableCellProperties",
            ],
          },

          // images
          image: {
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
            ],
          },

          //  links
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
        }}
      />
    </div>
  );
};

export default TextEditor;
