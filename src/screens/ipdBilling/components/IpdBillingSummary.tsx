import CustomLoader from "@/components/customLoader";
import BaseTable from "@/components/shared/BaseTable";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useMemo, useState } from "react";
import { IpdPatientItem, IpdSummaryBillingTableList } from "../types";

// Category Tabs Configuration
// const CATEGORY_TABS = [
//   { id: "Service", label: "Service", icon: "fa-solid fa-bell-concierge" },
//   { id: "Package", label: "Package", icon: "fa-solid fa-box" },
//   { id: "OP/IP Service", label: "OP/IP Service", icon: "fa-solid fa-hospital-user" },
//   { id: "Procedure", label: "Procedure", icon: "fa-solid fa-stethoscope" },
//   { id: "Investigation", label: "Investigation", icon: "fa-solid fa-microscope" },
//   { id: "Medicine", label: "Medicine", icon: "fa-solid fa-pills" },
//   { id: "Consumable", label: "Consumable", icon: "fa-solid fa-box-tissue" },
//   { id: "Implant", label: "Implant", icon: "fa-solid fa-heart-pulse" },
//   { id: "Miscellaneous", label: "Miscellaneous", icon: "fa-solid fa-ellipsis" },
// ];

// const DEPARTMENTS = ["IPD", "Cardiology", "Pathology", "Pharmacy", "Radiology", "General Medicine"];
// const DOCTORS = ["Dr. Amit Verma", "Dr. Reena Singh", "Dr. Sunil Kumar", "Dr. Priya Sharma"];

const SERVICE_DEFAULTS: Record<
  string,
  { code: string; rate: number; tax: number; category: string; type: string }
> = {
  "Deluxe Room (Per Day)": {
    code: "IPD-ROOM-001",
    rate: 5000,
    tax: 0,
    category: "Room",
    type: "Charge",
  },
  Consultation: { code: "DOC-001", rate: 1500, tax: 18, category: "Doctor", type: "Service" },
  "2D Echocardiography": {
    code: "PROC-002",
    rate: 2800,
    tax: 18,
    category: "Procedure",
    type: "Procedure",
  },
  "Complete Blood Count (CBC)": {
    code: "INV-001",
    rate: 600,
    tax: 18,
    category: "Investigation",
    type: "Investigation",
  },
  "Paracetamol 650mg": {
    code: "MED-045",
    rate: 15,
    tax: 18,
    category: "Medicine",
    type: "Medicine",
  },
  "IV Set": { code: "CON-021", rate: 250, tax: 18, category: "Consumable", type: "Consumable" },
  "Nursing Charges": {
    code: "MIS-010",
    rate: 800,
    tax: 0,
    category: "Miscellaneous",
    type: "Miscellaneous",
  },
};

const INITIAL_BILLING_ITEMS = [
  {
    id: 1,
    dateTime: "18-Aug-2026 10:15 AM",
    category: "Room",
    department: "IPD",
    serviceItem: "Deluxe Room (Per Day)",
    code: "IPD-ROOM-001",
    doctor: "--",
    qty: 2,
    rate: 5000,
    discount: 0,
    tax: 0,
    amount: 10000,
    type: "Charge",
    status: "Posted",
  },
  {
    id: 2,
    dateTime: "18-Aug-2026 09:40 AM",
    category: "Doctor",
    department: "Cardiology",
    serviceItem: "Consultation",
    code: "DOC-001",
    doctor: "Dr. Amit Verma",
    qty: 1,
    rate: 1500,
    discount: 0,
    tax: 18,
    amount: 1770,
    type: "Service",
    status: "Posted",
  },
  {
    id: 3,
    dateTime: "18-Aug-2026 11:10 AM",
    category: "Procedure",
    department: "Cardiology",
    serviceItem: "2D Echocardiography",
    code: "PROC-002",
    doctor: "Dr. Amit Verma",
    qty: 1,
    rate: 2800,
    discount: 0,
    tax: 18,
    amount: 3304,
    type: "Procedure",
    status: "Posted",
  },
  {
    id: 4,
    dateTime: "18-Aug-2026 12:05 PM",
    category: "Investigation",
    department: "Pathology",
    serviceItem: "Complete Blood Count (CBC)",
    code: "INV-001",
    doctor: "Dr. Reena Singh",
    qty: 1,
    rate: 600,
    discount: 0,
    tax: 18,
    amount: 708,
    type: "Investigation",
    status: "Posted",
  },
  {
    id: 5,
    dateTime: "18-Aug-2026 01:20 PM",
    category: "Medicine",
    department: "Pharmacy",
    serviceItem: "Paracetamol 650mg",
    code: "MED-045",
    doctor: "--",
    qty: 5,
    rate: 15,
    discount: 0,
    tax: 18,
    amount: 88.5,
    type: "Medicine",
    status: "Posted",
  },
  {
    id: 6,
    dateTime: "18-Aug-2026 02:30 PM",
    category: "Consumable",
    department: "IPD",
    serviceItem: "IV Set",
    code: "CON-021",
    doctor: "--",
    qty: 1,
    rate: 250,
    discount: 0,
    tax: 18,
    amount: 295,
    type: "Consumable",
    status: "Posted",
  },
  {
    id: 7,
    dateTime: "18-Aug-2026 03:00 PM",
    category: "Miscellaneous",
    department: "IPD",
    serviceItem: "Nursing Charges",
    code: "MIS-010",
    doctor: "--",
    qty: 1,
    rate: 800,
    discount: 0,
    tax: 0,
    amount: 800,
    type: "Miscellaneous",
    status: "Posted",
  },
];

const IpdBillingSummary = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(BranchContext)?.branchId ?? 1;

  const [groupBy, setGroupBy] = useState<string[]>([]);

  const getBillSummaryDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PATIENT_BILL_AMOUNTS,
      {},
      { params: { visitId: patient?.VisitId, patientId: patient?.PatientId } },
      { component: "IpdBillingSummary" }
    );
    return resp?.data?.[0] ?? {};
  };

  const { data: ipdBillingSummaryData = {} } = useQuery({
    queryKey: ["getBillSummaryDetails", patient],
    queryFn: () => getBillSummaryDetails(),
  });

  console.log("ipdBillingSummaryData", ipdBillingSummaryData);

  //

  const getIpdBillingSummaryDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_BILLING_SUMMARY,
      {},
      { params: { branchId, visitId: patient?.VisitId } },
      { component: "IpdBillingSummary" }
    );
    return resp?.data ?? [];
  };

  const { data: getIpdBillingSummaryLists = [] } = useQuery({
    queryKey: ["ipdBillingSummaryLists"],
    queryFn: () => getIpdBillingSummaryDetails(),
  });

  console.log("getIpdBillingSummaryLists", getIpdBillingSummaryLists);

  // columns
  const columns = useMemo<MRT_ColumnDef<IpdSummaryBillingTableList>[]>(
    () => [
      {
        accessorKey: "BillingDate",
        header: "Billing Date",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "CategoryName",
        header: "Category",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "SubCategoryName",
        header: "Sub Category",
        minSize: 120,
        enableGrouping: true,
      },

      {
        accessorKey: "SubSubCategoryName",
        header: "Sub Sub Category",
        minSize: 130,
        enableGrouping: true,
      },

      {
        accessorKey: "CreatedOnWithTime",
        header: "Date Time",
        minSize: 200,
        enableGrouping: true,
      },

      {
        accessorKey: "ServiceName",
        header: "Service / Item",
        minSize: 200,
        enableGrouping: true,
      },

      {
        accessorKey: "Code",
        header: "Code",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "DoctorName",
        header: "Doctor",
        minSize: 150,
        enableGrouping: true,
      },

      {
        accessorKey: "IsUnderPackage",
        header: "Is Under Package?",
        minSize: 150,
        enableGrouping: true,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          const isUnderPackage = value === 1;

          return (
            <span className="flex items-center">
              <span className="ml-2 text-sm text-gray-700">{isUnderPackage ? "Yes" : "No"}</span>
            </span>
          );
        },
      },

      {
        accessorKey: "Qty",
        header: "Qty",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "Rate",
        header: "Rate",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "DiscPer",
        header: "Discount (%)",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "DiscAmt",
        header: "Discount",
        minSize: 100,
        enableGrouping: true,
      },

      {
        accessorKey: "NetAmt",
        header: "Amount",
        minSize: 100,
        enableGrouping: true,
      },
      {
        accessorKey: "UserName",
        header: "User Name",
        minSize: 100,
        enableGrouping: true,
      },
    ],
    []
  );

  // Dynamic billing items array
  const [billingItems, setBillingItems] = useState(INITIAL_BILLING_ITEMS);

  // Form states
  const [department, setDepartment] = useState("IPD");
  const [serviceItem, setServiceItem] = useState("Deluxe Room (Per Day)");
  const [serviceCode, setServiceCode] = useState("IPD-ROOM-001");
  const [dateTime, setDateTime] = useState("18-Aug-2026 11:30 AM");
  const [doctor, setDoctor] = useState("--");
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(5000);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [remarks, setRemarks] = useState("");

  // Cumulative Bill Summary State (Right column)
  const [cumulativeSummary, setCumulativeSummary] = useState({
    grossBill: 184500,
    discount: 12500,
    tax: 11000,
    packageDiscount: 30000,
    paidAmount: 141000,
    totalDeposit: 150000,
  });

  // Auto populate on service item changes
  const handleServiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setServiceItem(selectedValue);
    const defaults = SERVICE_DEFAULTS[selectedValue];
    if (defaults) {
      setServiceCode(defaults.code);
      setRate(defaults.rate);
      setTaxPercent(defaults.tax);
    }
  };

  // Dynamically calculate current form item amount
  const computedFormAmount = useMemo(() => {
    const basic = quantity * rate;
    const discount = basic * (discountPercent / 100);
    const taxable = basic - discount;
    const tax = taxable * (taxPercent / 100);
    return Number((taxable + tax).toFixed(2));
  }, [quantity, rate, discountPercent, taxPercent]);

  // Handler to add new item
  const handleAddItem = () => {
    const defaults = SERVICE_DEFAULTS[serviceItem] || { category: "Service", type: "Service" };
    const newItem = {
      id: Date.now(),
      dateTime: dateTime || "18-Aug-2026 11:30 AM",
      category: defaults.category,
      department,
      serviceItem,
      code: serviceCode,
      doctor,
      qty: quantity,
      rate,
      discount: discountPercent,
      tax: taxPercent,
      amount: computedFormAmount,
      type: defaults.type,
      status: "Posted",
    };

    setBillingItems(prev => [...prev, newItem]);

    // Update cumulative totals
    const basicAmount = quantity * rate;
    const itemDiscount = basicAmount * (discountPercent / 100);
    const itemTax = (basicAmount - itemDiscount) * (taxPercent / 100);

    setCumulativeSummary(prev => ({
      ...prev,
      grossBill: prev.grossBill + basicAmount,
      discount: prev.discount + itemDiscount,
      tax: prev.tax + itemTax,
    }));

    // Reset Form fields
    setRemarks("");
  };

  // Handler to delete item
  const handleDeleteItem = (id: number) => {
    const itemToDelete = billingItems.find(item => item.id === id);
    if (!itemToDelete) return;

    setBillingItems(prev => prev.filter(item => item.id !== id));

    const basicAmount = itemToDelete.qty * itemToDelete.rate;
    const itemDiscount = basicAmount * (itemToDelete.discount / 100);
    const itemTax = (basicAmount - itemDiscount) * (itemToDelete.tax / 100);

    setCumulativeSummary(prev => ({
      ...prev,
      grossBill: prev.grossBill - basicAmount,
      discount: prev.discount - itemDiscount,
      tax: prev.tax - itemTax,
    }));
  };

  // Dynamic calculations for the Billing Items table
  const tableTotals = useMemo(() => {
    let rateSum = 0;
    let discountSum = 0;
    let taxSum = 0;
    let amountSum = 0;

    billingItems.forEach(item => {
      const basic = item.qty * item.rate;
      const disc = basic * (item.discount / 100);
      const taxable = basic - disc;
      const t = taxable * (item.tax / 100);

      rateSum += basic;
      discountSum += disc;
      taxSum += t;
      amountSum += item.amount;
    });

    return {
      rate: rateSum,
      discount: discountSum,
      tax: taxSum,
      amount: amountSum,
    };
  }, [billingItems]);

  // Derived summaries for Right Sidebar
  const netBill = cumulativeSummary.grossBill - cumulativeSummary.discount + cumulativeSummary.tax;
  const payableAmount = netBill - cumulativeSummary.packageDiscount;
  const balanceOutstanding = payableAmount - cumulativeSummary.paidAmount;

  // Format helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="w-full flex flex-col gap-5 p-1">
      {/* Dynamic Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* ==================== LEFT COLUMN (Main Actions & Tables) ==================== */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-5">
          {/* Card 1: Billing Items Table */}
          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-slate-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-list-check text-[#0B5394]"></i>
                Billing Items
              </h3>

              {/* Controls and filters */}
              {/* <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none">
                  <option>All Items</option>
                  <option>Services</option>
                  <option>Medicines</option>
                </select>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-100">
                  <i className="fa-regular fa-calendar text-slate-400" />
                  <span>15-Aug-2026 - 18-Aug-2026</span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#0B5394] text-white text-xs font-bold rounded-lg hover:bg-[#094376]"
                >
                  Search
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Hold Bill
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Estimate
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Clear Filters
                </button>
                <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden xl:block" />
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-[#0B5394] text-xs font-bold rounded-lg hover:bg-slate-50 ml-auto sm:ml-0"
                >
                  Import Charges
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-[#0B5394] text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Add Note
                </button>
              </div> */}
            </div>

            {/* {
    "CategoryId": 3,
    "CategoryName": "Investigations",
    "SubCategoryName": "Pathology",
    "SubCategoryId": 1,
    "SubSubCategoryName": "HEMATOLOGY",
    "PrintGroupName": "string",
    "SubSubCategoryId": 5,
    "ServiceItemId": 167,
    "ServiceCode": "1394",
    "ServiceName": "CBC (COMPLETE BLOOD COUNT)",
    "DoctorId": 6,
    "Rate": 222,
    "Qty": 1,
    "GrossAmt": 222,
    "DiscPer": 0,
    "DiscAmt": 0,
    "NetAmt": 222,
    "BillingDate": "03-09-2026",
    "CreatedOnWithTime": "03-09-2026 3:14PM",
    "DoctorName": "Dr. Ramjas Yadav",
    "UserId": 3,
    "UserName": "Prabhat  Trivedi (Prabhat)",
    "FTID": 24,
    "FTDId": 51,
    "VisitId": 7,
    "IsCorporateNonPayable": 0,
    "IsUnderPackage": 0,
    "Package": "",
    "IsSampleCollected": 0
} */}

            {/* Table Area */}
            {/* <div className="w-full overflow-x-auto border border-slate-200/60 rounded-xl hide-scrollbar max-h-md lg:max-h-100">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Billing Date</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Sub Category</th>
                    <th className="py-3 px-3">Sub Sub Category</th>
                    <th className="py-3 px-3">Service / Item</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3 text-right">Qty</th>
                    <th className="py-3 px-3 text-right">Rate (₹)</th>
                    <th className="py-3 px-3 text-right">Discount (₹)</th>
                    <th className="py-3 px-3 text-right">Tax (₹)</th>
                    <th className="py-3 px-3 text-right font-bold">Amount (₹)</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {getIpdBillingSummaryLists.map((item: IpdSummaryBillingTableList) => {
                    return (
                      <tr key={item?.VisitId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                          {item?.BillingDate}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                          {item?.CategoryName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{item?.SubCategoryName}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {item?.SubSubCategoryName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono">
                          {item?.ServiceName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                          {item?.DoctorName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">{item?.Qty}</td>
                        <td className="py-2.5 px-3 text-right">{formatCurrency(item?.Rate)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {formatCurrency(item?.DiscAmt)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {formatCurrency(item?.TaxAmt)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item?.NetAmount)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-slate-500 font-medium">{item?.BillingType}</span>
                        </td>
                        {/* <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] uppercase">
                            {item?.Status}
                          </span>
                        </td> 
                        {/* <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center text-slate-400 hover:text-blue-500"
                              title="View details"
                            >
                              <i className="fa-regular fa-eye" />
                            </button>
                            <button
                              type="button"
                              className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center text-slate-400 hover:text-amber-500"
                              title="Edit row"
                            >
                              <i className="fa-regular fa-pen-to-square" />
                            </button>
                            <button
                              type="button"
                              className="w-6 h-6 hover:bg-red-50 rounded flex items-center justify-center text-slate-400 hover:text-red-500"
                              title="Delete row"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <i className="fa-regular fa-trash-can" />
                            </button>
                          </div>
                        </td> 
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200/80 font-bold text-slate-800">
                    <td className="py-3 px-3" colSpan={6}>
                      Total Items: {billingItems.length}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">--</td>
                    <td className="py-3 px-3 text-right text-slate-400">--</td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {formatCurrency(tableTotals.discount)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {formatCurrency(tableTotals.tax)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 font-extrabold">
                      {formatCurrency(tableTotals.amount)}
                    </td>
                    <td className="py-3 px-3" colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div> */}

            <BaseTable
              columns={columns}
              data={getIpdBillingSummaryLists}
              showIndex
              enableGrouping
              groupBy={groupBy}
              onGroupingChange={setGroupBy}
              enableGroupingOnHeaderDoubleClick
            />
          </div>

          {/* Lower Dashboard Multi-Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Package Utilization (span 5) 
            <div className="lg:col-span-5 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                Package Utilization
              </h4>
              <div className="overflow-x-auto w-full hide-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b border-slate-100 pb-1">
                      <th className="py-1.5">Service Group</th>
                      <th className="py-1.5 text-right">Limit</th>
                      <th className="py-1.5 text-right">Used</th>
                      <th className="py-1.5 text-right">Balance</th>
                      <th className="py-1.5 text-right">Excess</th>
                      <th className="py-1.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    <tr>
                      <td className="py-2 text-slate-800">Room Charges</td>
                      <td className="py-2 text-right">5 Days</td>
                      <td className="py-2 text-right">4 Days</td>
                      <td className="py-2 text-right">1 Day</td>
                      <td className="py-2 text-right">0</td>
                      <td className="py-2 text-right font-semibold">40,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-800">Consultation</td>
                      <td className="py-2 text-right">5 Visits</td>
                      <td className="py-2 text-right">4</td>
                      <td className="py-2 text-right">1</td>
                      <td className="py-2 text-right">0</td>
                      <td className="py-2 text-right font-semibold">7,500.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-800">Investigation</td>
                      <td className="py-2 text-right">20,000.00</td>
                      <td className="py-2 text-right">18,500.00</td>
                      <td className="py-2 text-right">1,500.00</td>
                      <td className="py-2 text-right">0</td>
                      <td className="py-2 text-right font-semibold">18,500.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-800">Procedure</td>
                      <td className="py-2 text-right">60,000.00</td>
                      <td className="py-2 text-right">55,000.00</td>
                      <td className="py-2 text-right">5,000.00</td>
                      <td className="py-2 text-right">0</td>
                      <td className="py-2 text-right font-semibold">55,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-800 font-semibold text-red-600">
                        Consumables
                      </td>
                      <td className="py-2 text-right">30,000.00</td>
                      <td className="py-2 text-right text-red-600 font-semibold">34,600.00</td>
                      <td className="py-2 text-right">0</td>
                      <td className="py-2 text-right text-red-600">4,600.00</td>
                      <td className="py-2 text-right font-semibold">34,600.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-800">Medicines</td>
                      <td className="py-2 text-right">40,000.00</td>
                      <td className="py-2 text-right">36,900.00</td>
                      <td className="py-2 text-right">3,100.00</td>
                      <td className="py-2 text-right">0</td>
                      <td className="py-2 text-right font-semibold">36,900.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="font-bold border-t border-slate-200 text-slate-800">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right">2,50,000.00</td>
                      <td className="py-2 text-right">2,02,500.00</td>
                      <td className="py-2 text-right text-slate-500">11,600.00</td>
                      <td className="py-2 text-right text-red-600">4,600.00</td>
                      <td className="py-2 text-right text-slate-900 font-extrabold">1,92,500.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            */}

            {/* Payment History (span 4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                Payment History
              </h4>
              <div className="overflow-x-auto w-full hide-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b border-slate-100 pb-1">
                      <th className="py-1.5">Date</th>
                      <th className="py-1.5">Receipt No.</th>
                      <th className="py-1.5">Mode</th>
                      <th className="py-1.5 text-right">Amount</th>
                      <th className="py-1.5 text-right">Adjusted</th>
                      <th className="py-1.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    <tr>
                      <td className="py-2 whitespace-nowrap">15-Aug-2026</td>
                      <td className="py-2 font-semibold text-blue-600 whitespace-nowrap cursor-pointer">
                        ADV-10245
                      </td>
                      <td className="py-2">UPI</td>
                      <td className="py-2 text-right">50,000.00</td>
                      <td className="py-2 text-right text-slate-500">45,000.00</td>
                      <td className="py-2 text-right">5,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 whitespace-nowrap">16-Aug-2026</td>
                      <td className="py-2 font-semibold text-blue-600 whitespace-nowrap cursor-pointer">
                        ADV-10311
                      </td>
                      <td className="py-2">Cash</td>
                      <td className="py-2 text-right">30,000.00</td>
                      <td className="py-2 text-right text-slate-500">30,000.00</td>
                      <td className="py-2 text-right">0.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 whitespace-nowrap">17-Aug-2026</td>
                      <td className="py-2 font-semibold text-blue-600 whitespace-nowrap cursor-pointer">
                        ADV-10482
                      </td>
                      <td className="py-2">Card</td>
                      <td className="py-2 text-right">40,000.00</td>
                      <td className="py-2 text-right text-slate-500">40,000.00</td>
                      <td className="py-2 text-right">0.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 whitespace-nowrap">18-Aug-2026</td>
                      <td className="py-2 font-semibold text-blue-600 whitespace-nowrap cursor-pointer">
                        ADV-10523
                      </td>
                      <td className="py-2">Insurance</td>
                      <td className="py-2 text-right">30,000.00</td>
                      <td className="py-2 text-right text-slate-500">26,000.00</td>
                      <td className="py-2 text-right">4,000.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="font-bold border-t border-slate-200 text-slate-800">
                      <td className="py-2" colSpan={3}>
                        Total
                      </td>
                      <td className="py-2 text-right">1,50,000.00</td>
                      <td className="py-2 text-right text-slate-500">1,41,000.00</td>
                      <td className="py-2 text-right text-emerald-600">9,000.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Recent Payments (span 3) 
            <div className="lg:col-span-3 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider">
                  Recent Payments
                </h4>
                <span className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
                  View All
                </span>
              </div>
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto hide-scrollbar pr-0.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex flex-col">
                    <span className="text-slate-800">18-Aug-2026 04:20 PM</span>
                    <span className="text-blue-500 font-bold font-mono">PAY-50021</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase font-bold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                      UPI
                    </span>
                    <span className="text-slate-900 font-bold">10,000.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex flex-col">
                    <span className="text-slate-800">18-Aug-2026 02:15 PM</span>
                    <span className="text-blue-500 font-bold font-mono">PAY-50020</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase font-bold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                      Card
                    </span>
                    <span className="text-slate-900 font-bold">20,000.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex flex-col">
                    <span className="text-slate-800">17-Aug-2026 06:10 PM</span>
                    <span className="text-blue-500 font-bold font-mono">PAY-50019</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase font-bold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                      Cash
                    </span>
                    <span className="text-slate-900 font-bold">30,000.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex flex-col">
                    <span className="text-slate-800">16-Aug-2026 07:30 PM</span>
                    <span className="text-blue-500 font-bold font-mono">PAY-50018</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase font-bold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                      Card
                    </span>
                    <span className="text-slate-900 font-bold">20,000.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex flex-col">
                    <span className="text-slate-800">15-Aug-2026 05:40 PM</span>
                    <span className="text-blue-500 font-bold font-mono">PAY-50017</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase font-bold text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                      UPI
                    </span>
                    <span className="text-slate-900 font-bold">20,000.00</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-extrabold text-slate-800">
                <span>Total Received</span>
                <span className="text-slate-900 font-extrabold">1,00,000.00</span>
              </div>
            </div>

            */}
          </div>

          {/* Left Column Bottom Action Buttons bar */}
          {/* <div className="flex flex-wrap items-center justify-between gap-3 mt-1 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Cancel Bill
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Save Draft
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Hold Bill
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-[#0B5394] bg-white hover:bg-blue-50/50 text-[#0B5394] font-bold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Request Approval
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-[#0B5394] bg-white hover:bg-blue-50/50 text-[#0B5394] font-bold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Collect Payment
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-[#0B5394] bg-white hover:bg-blue-50/50 text-[#0B5394] font-bold text-xs rounded-xl uppercase tracking-wider transition"
              >
                Generate Final Bill
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow-sm transition"
              >
                Finalize Bill & Discharge
              </button>
            </div>
          </div> */}
        </div>

        {/* ==================== RIGHT COLUMN (Summaries & Shortcuts) ==================== */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Card 1: Bill Summary */}

          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3.5">
            <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Bill Summary
            </h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span>Total Bill Amount</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.TotalBillAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Discount(%)</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.TotalDiscountPerOnBill)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Discount</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.TotalDiscountAmountOnBill)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Round Off</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.RoundOff)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Payable Amount</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.TotalPayableAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Balance Amount</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.TotalBalanceAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Patient Advance Amt</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.PatientAdvanceAmt)}
                </span>
              </div>
              {/* <div className="flex items-center justify-between">
                <span>GST Amount</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(ipdBillingSummaryData.GSTAmt)}
                </span>
              </div> */}
              {/* <div className="flex items-center justify-between">
                <span>Discount</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(cumulativeSummary.discount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span className="text-slate-900 font-bold">
                  {formatCurrency(cumulativeSummary.tax)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold text-slate-800">
                <span>Net Bill</span>
                <span className="text-slate-900 font-extrabold">{formatCurrency(netBill)}</span>
              </div>

              <div className="border-t border-slate-100/70 pt-2.5 flex items-center justify-between text-emerald-600">
                <span>Package Discount</span>
                <span className="font-bold">
                  -{formatCurrency(cumulativeSummary.packageDiscount)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold text-slate-800 text-sm">
                <span>Payable Amount</span>
                <span className="text-slate-900 font-extrabold">
                  {formatCurrency(payableAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>Paid Amount</span>
                <span className="font-bold">-{formatCurrency(cumulativeSummary.paidAmount)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 font-extrabold text-red-600 text-sm">
                <span>Balance (₹)</span>
                <span className="font-extrabold text-red-600 text-base">
                  {formatCurrency(balanceOutstanding)}
                </span>
              </div> */}
            </div>
          </div>

          {/* Card 2: Package Details 
          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3.5">
            <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Package Details
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
              <div className="flex items-start justify-between gap-2">
                <span>Package Name</span>
                <span className="text-[#0B5394] font-bold text-right max-w-[65%]">
                  Cardiac Care Package
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Package Amount</span>
                <span className="text-slate-900 font-bold">2,50,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Used Amount</span>
                <span className="text-slate-900 font-bold">1,92,500.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Balance Amount</span>
                <span className="text-slate-900 font-bold">57,500.00</span>
              </div>

            
              <div className="w-full mt-1.5">
                <div className="w-full h-5.5 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200/40">
                  <div
                    className="h-full bg-[#0B5394] rounded-lg transition-all duration-300"
                    style={{ width: "77%" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-white">
                    77% Used
                  </div>
                </div>
              </div>
            </div>
          </div>

          */}

          {/* Card 3: Deposit Details */}
          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
            <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Deposit Details
            </h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span>Total Deposit</span>
                <span className="text-slate-900 font-bold">1,50,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Adjusted</span>
                <span className="text-slate-900 font-bold">1,41,000.00</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold text-emerald-600">
                <span>Balance Deposit</span>
                <span className="text-emerald-600 font-extrabold">9,000.00</span>
              </div>
            </div>
          </div>

          {/* Card 4: Payment Shortcuts 
          <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-3">
            <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Payment Shortcuts
            </h4>
            <div className="grid grid-cols-3 gap-2 mt-0.5">
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl hover:border-[#0B5394]/30 hover:shadow-[0_2px_8px_rgba(11,83,148,0.05)] transition-all duration-200 group text-center"
              >
                <i className="fa-solid fa-money-bill-wave text-base text-[#0B5394] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Cash</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl hover:border-[#0B5394]/30 hover:shadow-[0_2px_8px_rgba(11,83,148,0.05)] transition-all duration-200 group text-center"
              >
                <i className="fa-solid fa-credit-card text-base text-[#0B5394] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Card</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl hover:border-[#0B5394]/30 hover:shadow-[0_2px_8px_rgba(11,83,148,0.05)] transition-all duration-200 group text-center"
              >
                <i className="fa-solid fa-qrcode text-base text-[#0B5394] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">UPI</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl hover:border-[#0B5394]/30 hover:shadow-[0_2px_8px_rgba(11,83,148,0.05)] transition-all duration-200 group text-center"
              >
                <i className="fa-solid fa-building-columns text-base text-[#0B5394] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
                  Bank Transfer
                </span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl hover:border-[#0B5394]/30 hover:shadow-[0_2px_8px_rgba(11,83,148,0.05)] transition-all duration-200 group text-center"
              >
                <i className="fa-solid fa-money-check text-base text-[#0B5394] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Cheque</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl hover:border-[#0B5394]/30 hover:shadow-[0_2px_8px_rgba(11,83,148,0.05)] transition-all duration-200 group text-center"
              >
                <i className="fa-solid fa-shield-halved text-base text-[#0B5394] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Insurance</span>
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IpdBillingSummary;
