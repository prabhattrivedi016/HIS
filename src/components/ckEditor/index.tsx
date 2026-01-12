import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";

const TextEditor = ({ value, onChange }) => {
  const handleChange = (event, editor) => {
    const htmlData = editor?.getData();
    onChange(htmlData);
  };

  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={handleChange}
      config={{
        toolbar: {
          items: [
            "heading",
            "|",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "alignment",
            "|",
            "insertTable",
            "imageUpload",
            "blockQuote",
            "horizontalLine",
            "|",
            "undo",
            "redo",
          ],
          shouldNotGroupWhenFull: true,
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
          toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"],
        },
      }}
    />
  );
};

export default TextEditor;
