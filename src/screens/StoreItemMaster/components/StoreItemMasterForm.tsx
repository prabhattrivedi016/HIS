import InputField from "@/components/customInputField";
import { Plus, Printer, RefreshCw, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function StoreItemMasterForm() {
  const [toggles, setToggles] = useState({
    active: true,
    trackBatch: true,
    trackExpiry: true,
    barcodeApplicable: true,
    stockableItem: true,
    capitalItem: false,
    highRiskItem: false,
    controlledNarcotic: false,
    expiryTracking: true,
    fefoIssue: true,
    batchMandatory: true,
    allowExpiredIssue: false,
    sterileItem: false,
    singleUse: true,
    recallItem: false,
    restrictedItem: false,
    priceInclusive: true,
  });

  const [itemImage, setItemImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleToggle = key => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setItemImage(imageUrl);
    }
  };

  const handleImageRemove = () => {
    setItemImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card p-3 sm:p-4 mt-2">
      {/* ================= MAIN FORM SECTION (BASIC DETAILS) ================= */}
      <div className="space-y-3 text-xs">
        {/* Top Block: Row 1 & Row 2 Combined with Barcode Box on Right */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          {/* Left Container for Row 1 and Row 2 */}
          <div className="flex-1 space-y-3">
            {/* Row 1: Item Code, Name, Generic, Barcode Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <InputField label="Item Code" required>
                  <div className="relative flex items-center">
                    <input type="text" defaultValue="ST0001256" className="input-field pr-8" />
                    <RefreshCw
                      size={14}
                      className="absolute right-2.5 text-gray-400 cursor-pointer hover:text-blue-600"
                    />
                  </div>
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Item Name" required>
                  <input type="text" defaultValue="N95 Respirator Mask" className="input-field" />
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Generic / Standard Name" required>
                  <input type="text" defaultValue="N95 Mask" className="input-field" />
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Barcode Type" required>
                  <select className="input-field cursor-pointer">
                    <option>Code128</option>
                    <option>EAN-13</option>
                    <option>UPC</option>
                  </select>
                </InputField>
              </div>
            </div>

            {/* Row 2: Item Type, Item Category, Sub Category, Item Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <InputField label="Item Type" required>
                  <select className="input-field cursor-pointer">
                    <option>Consumable</option>
                    <option>Non-Consumable</option>
                  </select>
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Item Category" required>
                  <select className="input-field cursor-pointer">
                    <option>PPE (Personal Protective Equipment)</option>
                    <option>Medical Supplies</option>
                  </select>
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Sub Category" required>
                  <select className="input-field cursor-pointer">
                    <option>Mask & Respirator</option>
                    <option>Gloves</option>
                  </select>
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Item Group" required>
                  <select className="input-field cursor-pointer">
                    <option>Safety Items</option>
                    <option>General Store</option>
                  </select>
                </InputField>
              </div>
            </div>
          </div>

          {/* Right: Barcode Preview Box aligned to both rows height */}
          <div className="lg:w-[220px] bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-row items-center justify-center relative shrink-0 gap-2">
            <span className="text-[10px] font-bold text-gray-400 absolute top-1 left-2">
              Barcode Preview
            </span>
            <div className="text-center mt-2 flex-wrap overflow-hidden w-[60%] ">
              <div className="tracking-tighter text-lg font-bold text-gray-900 leading-none ">
                ||||||||||||||||||||||||||
              </div>
              <span className="text-[10px] font-bold text-gray-800">ST0001256</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-col ">
              <button
                onClick={() => alert("Generate Barcode")}
                className="text-[9px] bg-[#0B5394] text-white px-2  rounded font-bold hover:bg-blue-700 cursor-pointer  py-1"
              >
                Generate
              </button>
              <button
                onClick={() => alert("Print Barcode")}
                className="text-[9px] bg-white border border-gray-300 text-gray-700 px-2  rounded font-bold hover:bg-gray-50 cursor-pointer flex items-center gap-0.5 px-1 py-1"
              >
                <Printer size={10} />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Block: Row 3 & Row 4 Combined with Item Image Box on Right */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch pt-2">
          {/* Left Container for Row 3 and Row 4 */}
          <div className="flex-1 space-y-3">
            {/* Row 3: Brand, HSN, Model, Specification, Shelf Life, Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-3">
                <InputField label="Brand / Manufacturer" required>
                  <div className="flex items-center gap-1">
                    <input type="text" defaultValue="3M India Ltd." className="input-field" />
                    <button className="bg-[#0B5394] text-white p-2 rounded-lg border border-blue-200 hover:bg-blue-900 cursor-pointer flex items-center justify-center shrink-0 mt-[-9px]">
                      <Plus size={14} />
                    </button>
                  </div>
                </InputField>
              </div>

              <div className="lg:col-span-2">
                <InputField label="HSN / SAC Code" required>
                  <input type="text" defaultValue="63079090" className="input-field" />
                </InputField>
              </div>

              <div className="lg:col-span-1">
                <InputField label="Model No." required>
                  <input type="text" defaultValue="8210" className="input-field" />
                </InputField>
              </div>

              <div className="lg:col-span-3">
                <InputField label="Specification" required>
                  <input
                    type="text"
                    defaultValue="N95 particulate respirator"
                    className="input-field"
                  />
                </InputField>
              </div>

              <div className="lg:col-span-2">
                <InputField label="Shelf Life" required>
                  <input type="text" defaultValue="60" className="input-field text-center" />
                </InputField>
              </div>

              <div className="lg:col-span-1 flex flex-col items-center justify-center ">
                <InputField label="Active" required>
                  <div className="flex items-center justify-center pt-1 mt-[-4px]">
                    <button
                      onClick={() => handleToggle("active")}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${toggles.active ? "bg-[#0B5394]" : "bg-gray-300"}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${toggles.active ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                  <span className="text-[8px] opacity-0">ttg</span>
                </InputField>
              </div>
            </div>

            {/* Row 4: UOM, Conversion Factor, Alternative UOM, Conversion Value, Item Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-2">
                <InputField label="Unit of Measurement" required>
                  <select className="input-field cursor-pointer">
                    <option>PCS</option>
                    <option>Box</option>
                  </select>
                </InputField>
              </div>

              <div className="lg:col-span-2">
                <InputField label="Conversion Factor" required>
                  <input type="text" defaultValue="1" className="input-field" />
                </InputField>
              </div>

              <div className="lg:col-span-2">
                <InputField label="Alternative UOM" required>
                  <select className="input-field cursor-pointer">
                    <option>Box</option>
                    <option>Packet</option>
                  </select>
                </InputField>
              </div>

              <div className="lg:col-span-2">
                <InputField label="Conversion Value" required>
                  <div className="flex justify-between items-center gap-2">
                    <input type="text" defaultValue="20" className="input-field" />
                    <span className="text-[11px] text-gray-400 font-medium w-full">
                      1 Box = 20 PCS
                    </span>
                  </div>
                </InputField>
              </div>

              <div className="lg:col-span-4">
                <InputField label="Item Description" required>
                  <div className="flex justify-between items-center gap-2">
                    <textarea
                      defaultValue="N95 particulate respirator mask for healthcare workers."
                      className="input-field w-full h-[60px]"
                      rows={2}
                    />
                    <span className="text-[11px] text-gray-400 shrink-0">64/500</span>
                  </div>
                </InputField>
              </div>
            </div>
          </div>

          {/* Right: Item Image Upload Box with active preview */}
          <div className="lg:w-[180px] bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-row items-center justify-between relative shrink-0">
            <span className="text-[10px] font-bold text-gray-500 absolute top-1 left-2">
              Item Image
            </span>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-2xs my-2  mt-3 lg:mt-0">
              {itemImage ? (
                <img src={itemImage} alt="Item Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] text-gray-400 font-bold">[ Mask ]</span>
              )}
            </div>

            <div className="flex items-center  flex-col">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer border border-gray-300 px-2 py-1 rounded-lg"
              >
                <Upload size={10} /> Upload
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleImageRemove}
                className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer border border-gray-300 px-2 py-1 rounded-lg"
              >
                <Trash2 size={10} /> Remove
              </button>
            </div>
          </div>
        </div>

        {/* Row 5: Toggle Flags */}
        <div className="flex flex-row lg:grid lg:grid-cols-7 gap-2 pt-2 border-t border-gray-100 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1">
          {[
            { label: "Track Batch No.", key: "trackBatch" },
            { label: "Track Expiry Date", key: "trackExpiry" },
            { label: "Barcode Applicable", key: "barcodeApplicable" },
            { label: "Stockable Item", key: "stockableItem" },
            { label: "Capital Item", key: "capitalItem" },
            { label: "High Risk Item", key: "highRiskItem" },
            { label: "Controlled / Narcotic", key: "controlledNarcotic" },
          ].map(item => {
            const isOn = toggles[item.key];
            return (
              <div
                key={item.key}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-between gap-1.5 min-w-[130px] lg:min-w-0 shrink-0 lg:shrink"
              >
                <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">
                  {item.label}
                </span>
                <div className="flex items-center w-full rounded-md overflow-hidden border border-gray-300 text-[10px] font-bold">
                  <button
                    onClick={() => setToggles(p => ({ ...p, [item.key]: true }))}
                    className={`flex-1 py-1 text-center cursor-pointer transition-colors h-[35px] ${isOn ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setToggles(p => ({ ...p, [item.key]: false }))}
                    className={`flex-1 py-1 text-center cursor-pointer transition-colors h-[35px] ${!isOn ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
