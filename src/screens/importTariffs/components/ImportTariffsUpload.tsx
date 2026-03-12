import InputField from "@/components/customInputField";
import type React from "react";
import { useState } from "react";
import * as XLSX from "xlsx";

const ImportTariffsUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Array<Array<unknown>>>([]);
  const [fileError, setFileError] = useState<string>("");

  const readFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = event => {
      const result = event.target?.result;
      if (!result) return;
      const data = new Uint8Array(result as ArrayBuffer);

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json<Array<unknown[]>>(worksheet, { header: 1 });

      const sheetHeaders = (jsonData[0] || []).map(v => String(v));

      const sheetRows = jsonData.slice(1);

      setHeaders(sheetHeaders);
      setRows(sheetRows);

      console.log("Headers:", sheetHeaders);
      console.log("Rows:", sheetRows);
    };
    reader.readAsArrayBuffer(file);
  };

  const fileUploadHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0] ?? null;

    setSelectedFile(file);
    if (file) setFileError("");
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError("Document is required");
      return;
    }
    readFile(selectedFile);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex] = [...updatedRows[rowIndex]];
      updatedRows[rowIndex][colIndex] = value;
      return updatedRows;
    });
  };
  return (
    <div className="-mt-3">
      <div className="card mb-1">
        <h2 className="card-title ">Import Tariffs Document Upload</h2>

        <form onSubmit={submitHandler}>
          <div className="form-grid-4">
            <InputField label="Upload Document" required>
              <input
                type="file"
                className="file-upload"
                accept=".xlsx, .xls"
                onChange={fileUploadHandler}
              />
              {fileError && !selectedFile && <p className="input-field-error">{fileError}</p>}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Upload
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {!!headers && headers.length > 0 && (
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size min-h-90 max-h-100 lg:min-h-90 lg:max-h-90">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {headers.map((h, index) => (
                      <th key={`${h}-${index}`} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={headers.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}
                  {rows.map((row, idx) => (
                    <tr key={idx} className="table-row">
                      {headers.map((_, colIdx) => (
                        <td key={colIdx} className="table-td">
                          <input
                            className={`px-2 py-1   ${
                              !row?.[colIdx] || String(row?.[colIdx]).trim() === ""
                                ? "bg-yellow-100 border-yellow-400"
                                : "border-gray-300"
                            }`}
                            value={String(row?.[colIdx] ?? "")}
                            onChange={e => handleCellChange(idx, colIdx, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-actions-responsive m-2">
              <button type="submit" className="save-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportTariffsUpload;
