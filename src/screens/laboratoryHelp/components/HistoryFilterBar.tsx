import {
  Droplet,
  Building2,
  FlaskConical,
  File,
 Check,
  Zap,
  Truck,
  AlertTriangle,
  Pause,
  FileText,
} from "lucide-react";

export default function HistoryFilterBar() {
  return (
    <div className="card mt-2 overflow-hidden ">
      {/* ================= HORIZONTAL SCROLLABLE CARDS CONTAINER (12 Sample Status Cards) ================= */}
      <div className="flex flex-row overflow-x-auto gap-3 px-3 py-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">

        {/* 1. COLLECTION PENDING */}
        <div className="h-[80px] min-w-[150px] border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-red-50 flex items-center justify-center shrink-0">
              <Droplet size={30} strokeWidth={2.2} className="text-red-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Collection Pending
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                12
              </div>
              
            </div>
          </div>
        </div>

        {/* 2. DEPARTMENT RECEIVED */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <Building2 size={40} strokeWidth={2.2} className="text-blue-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Department Received
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                08
              </div>
            </div>
          </div>
        </div>

        {/* 3. SAMPLE COLLECTED */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-[#fef3c7] flex items-center justify-center shrink-0">
              <FlaskConical size={40} strokeWidth={2.2} className="text-orange-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Sample Collected
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                18
              </div>
              
            </div>
          </div>
        </div>

        {/* 4. In Laboratory  */}
        <div className="h-[80px] min-w-[150px] border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <FlaskConical size={40} strokeWidth={2.2} className="text-blue-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                In Laboratory
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                24
              </div>
              
            </div>
          </div>
        </div>

        {/* 5. Outsourcig Pending */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[59px] rounded-md bg-orange-50 flex items-center justify-center shrink-0">
              <Truck size={40} strokeWidth={2.2} className="text-orange-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
               Outsource Pending
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                06
              </div>
            </div>
          </div>
          
        </div>

        {/* 6. Outsource Dispatched */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <Zap size={40} strokeWidth={2.2} className="text-purple-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Outsource Dispatched
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                08
              </div>
            </div>
          </div>
        </div>

        {/* 7. Outsource Received */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <File size={40} strokeWidth={2.2} className="text-purple-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Outsource Received
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                210
              </div>
            </div>
          </div>
        </div>

        {/* 8. Abnormal */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={40} strokeWidth={2.2} className="text-red-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Abnormal
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                156
              </div>
            </div>
          </div>
        </div>

        {/* 9. Hold */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-pink-50 flex items-center justify-center shrink-0">
              <Pause size={40} strokeWidth={2.2} className="text-pink-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Hold
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                05
              </div>
            </div>
          </div>
        </div>

        {/* 10. Approved */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-green-50 flex items-center justify-center shrink-0">
              <Check size={40} strokeWidth={2.2} className="text-green-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Approved
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                28
              </div>
            </div>
          </div>
        </div>

        {/* 11. IN LABORATORY */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-green-50 flex items-center justify-center shrink-0">
              <Truck size={40} strokeWidth={2.2} className="text-green-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Dispatched
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                13
              </div>
            </div>
          </div>
        </div>

        {/* 12. REPORT PENDING */}
        <div className="h-[80px] min-w-[150px]  border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-gray-50 flex items-center justify-center shrink-0">
              <FileText size={40} strokeWidth={2.2} className="text-gray-300" />
            </div>
            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">
                Report Pending
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                38
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}