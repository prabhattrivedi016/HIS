import { useState, useRef } from "react";
import { FileText, Paperclip, Upload, RefreshCw, Eye, Save, Printer } from "lucide-react";

export default function Footer() {
    const [remarks, setRemarks] = useState("");
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    return (
        <div className="card  p-3 sm:p-4  mt-2 ">

            {/* Two Main Containers: Left (Remarks) & Right (Attachments) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Left Container: Remarks */}
                <div className="lg:col-span-6 flex flex-col justify-between  p-3">
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-gray-200 text-blue-900 font-bold text-xs">
                        <FileText size={14} className="text-blue-600" />
                        <span>Remarks</span>
                    </div>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter remarks..."
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none min-h-[95px]"
                    />
                </div>

                {/* Right Container: Attachments */}
                <div className="lg:col-span-6 flex flex-col justify-between  lg:border-l lg:border-gray-200  p-3">
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-gray-200 text-blue-900 font-bold text-xs">
                        <Paperclip size={14} className="text-blue-600" />
                        <span>Attachments</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-1">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                            <Upload size={13} />
                            <span>Upload Invoice / Documents</span>
                        </button>
                        <span className="text-[11px] text-gray-500 font-medium italic truncate max-w-[220px]">
                            {fileName ? `Selected: ${fileName}` : "No file chosen"}
                        </span>
                    </div>

                    <div className="text-[10px] text-gray-400 mt-2 font-medium">
                        Supported: PDF, JPG, PNG (Max 5 MB)
                    </div>
                    {/* Bottom Action Buttons Bar (4 Buttons) */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 ">
                        <button
                            onClick={() => alert("Clear clicked")}
                            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                            <RefreshCw size={13} />
                            <span>Clear</span>
                        </button>

                        <button
                            onClick={() => alert("Preview GRN clicked")}
                            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-blue-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                            <Eye size={13} />
                            <span>Preview GRN</span>
                        </button>

                        <button
                            onClick={() => alert("Save GRN clicked")}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                            <Save size={13} />
                            <span>Save GRN</span>
                        </button>

                        <button
                            onClick={() => alert("Save & Print clicked")}
                            className="w-full sm:w-auto bg-[#0B5394] hover:bg-blue-900 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                            <Printer size={13} />
                            <span>Save & Print</span>
                        </button>
                    </div>
                </div>

            </div>

            

        </div>
    );
}