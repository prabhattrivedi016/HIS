import InputField from "@/components/customInputField";
import { Barcode as BarcodeIcon, Layers, ShieldCheck, Sliders } from "lucide-react";
import { useState } from "react";

export default function BatchExpiry() {
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

  return (
    <div className="card   rounded-xl  space-y-2 mt-2">
      <div className="flex lg:flex-row gap-2  flex-col">
        {/* ================= SUB-SECTION 1: BATCH & EXPIRY SETTINGS ================= */}
        <div className="card space-y-2 mt-1  ">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 text-blue-900 font-bold text-xs">
            <Layers size={14} className="text-blue-600" />
            <span>Batch & Expiry Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs ">
            <div className="flex flex-col gap-1 mt-[-3px]">
              <label className="font-bold text-gray-700">Expiry Tracking *</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, expiryTracking: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.expiryTracking ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, expiryTracking: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.expiryTracking ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Expiry Alert (Days) *</label>
              <input type="text" defaultValue="90" className="input-field" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">FEFO Issue</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, fefoIssue: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.fefoIssue ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, fefoIssue: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.fefoIssue ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-[-3px]">
              <label className="font-bold text-gray-700">Batch Mandatory</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, batchMandatory: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.batchMandatory ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, batchMandatory: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.batchMandatory ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-[-3px]">
              <label className="font-bold text-gray-700">Allow Expired Issue</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, allowExpiredIssue: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.allowExpiredIssue ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, allowExpiredIssue: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.allowExpiredIssue ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SUB-SECTION 2: STOCK LOCATION ================= */}
        <div className="card space-y-2">
          <div className="flex items-center gap-1  border-b border-gray-100 text-blue-900 font-bold text-xs pb-2.5">
            <Sliders size={14} className="text-blue-600" />
            <span>Stock Location</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 items-center text-xs">
            <div className="flex flex-col gap-1">
              <InputField label="Default Store" required>
                <select className="input-field cursor-pointer">
                  <option>Central Store</option>
                  <option>Emergency Store</option>
                </select>
              </InputField>
            </div>

            <div className="flex flex-col gap-1">
              <InputField label="Default Location" required>
                <select className="input-field cursor-pointer">
                  <option>Rack A</option>
                  <option>Rack B</option>
                </select>
              </InputField>
            </div>

            <div className="flex flex-col gap-1">
              <InputField label="Default Bin">
                <select className="input-field cursor-pointer">
                  <option>A-01</option>
                  <option>A-02</option>
                </select>
              </InputField>
            </div>

            <div className="flex flex-col gap-1">
              <InputField label="Min Level" required>
                <input type="text" defaultValue="500" className="input-field" />
              </InputField>
            </div>

            <div className="flex flex-col gap-1">
              <InputField label="Reorder Level" required>
                <input type="text" defaultValue="1,000" className="input-field" />
              </InputField>
            </div>

            <div className="flex flex-col gap-1">
              <InputField label="Max Level" required>
                <input type="text" defaultValue="5,000" className="input-field" />
              </InputField>
            </div>
          </div>
        </div>
      </div>
      {/* ================= BOTTOM TWO COLUMNS: PRICING & TAXATION / NABH & QUALITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Pricing & Taxation */}
        <div className="lg:col-span-6 card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-gray-100 text-blue-900 font-bold text-xs">
              <BarcodeIcon size={14} className="text-blue-600" />
              <span>Pricing & Taxation</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center text-xs">
              <div className="flex flex-col gap-1">
                <InputField label="MRP (₹)" required>
                  <input type="text" defaultValue="180.00" className="input-field" />
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Purchase Rate (₹)" required>
                  <input type="text" defaultValue="120.00" className="input-field" />
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Default Issue Rate (₹)">
                  <input type="text" defaultValue="150.00" className="input-field" />
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="Tax Type">
                  <select className="input-field cursor-pointer">
                    <option>GST</option>
                    <option>VAT</option>
                  </select>
                </InputField>
              </div>

              <div className="flex flex-col gap-1">
                <InputField label="GST %">
                  <select className="input-field cursor-pointer">
                    <option>12%</option>
                    <option>5%</option>
                    <option>18%</option>
                  </select>
                </InputField>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={toggles.priceInclusive}
              className="rounded border-gray-300 text-blue-600 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-700">Price Inclusive of Tax</span>
          </div>
        </div>

        {/* NABH & Quality */}
        <div className="lg:col-span-6 card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-gray-100 text-blue-900 font-bold text-xs">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>NABH & Quality</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center text-xs">
            <div className="flex flex-col gap-1">
              <InputField label="Class">
                <select className="input-field cursor-pointer">
                  <option>B - Important</option>
                  <option>A - Critical</option>
                </select>
              </InputField>
            </div>

            <div className="flex flex-col gap-1">
              <InputField label="Storage Condition">
                <select className="input-field cursor-pointer">
                  <option>Dry & Cool</option>
                  <option>Refrigerated</option>
                </select>
              </InputField>
            </div>

            <div className="flex flex-col gap-1 mt-[-5px]">
              <label className="font-bold text-gray-700">Streile Item</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, sterileItem: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.sterileItem ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, sterileItem: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.sterileItem ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-[-5px]">
              <label className="font-bold text-gray-700">Single-Use</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, singleUse: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.singleUse ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, singleUse: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.singleUse ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Recall Item</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, recallItem: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.recallItem ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, recallItem: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.recallItem ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className=" text-gray-900">Restricted Item</label>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-300 font-bold text-[10px]">
                <button
                  onClick={() => setToggles(p => ({ ...p, restrictedItem: true }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${toggles.restrictedItem ? "bg-[#0B5394] text-white" : "bg-white text-gray-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setToggles(p => ({ ...p, restrictedItem: false }))}
                  className={`flex-1 py-3 text-center cursor-pointer ${!toggles.restrictedItem ? "bg-rose-600 text-white" : "bg-white text-gray-700"}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
