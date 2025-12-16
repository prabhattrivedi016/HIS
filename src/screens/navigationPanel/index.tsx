import { Edit } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import NavigationPanelDrawer from "./components/NavigationPanelDrawer";
import PageMapping from "./components/PageMapping";
import { SubMenuItem } from "./types";

const NavigationPanel = () => {
  const [subMenuMaster, setSubMenuMaster] = useState<SubMenuItem[]>([]);
  const { loading, error, fetchApi } = useGlobalApi();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<SubMenuItem[]>([]);
  const [drawerTitle, setDrawerTitle] = useState("Add New Pane");
  const [buttonTitle, setButtonTitle] = useState("Create New Pane");
  const [updatedValue, setUpdatedValue] = useState<SubMenuItem | null>(null);
  const [openPageMapping, setOpenPageMapping] = useState(false);

  // fetch submenu master
  const getNavigationMenu = async () => {
    const response = await fetchApi("GET", ENDPOINTS.GET_NAVIGATION_SUB_MENU_MASTER);
    if (!response) return;
    setSubMenuMaster(response?.data);
    setFilteredData(response?.data);
  };

  useEffect(() => {
    getNavigationMenu();
  }, []);

  // headers
  const headers = ["Tab Name", "SubMenu Name", "Url", "Status", "Ip Address"];

  // map UI headers to API keys
  const headerMapping: Record<string, keyof SubMenuItem> = {
    "Tab Name": "tabName",
    "SubMenu Name": "subMenuName",
    Url: "url",
    Status: "isActive",
    "Ip Address": "ipAddress",
  };

  // Add Panel Handler
  const AddNewHandler = () => {
    setIsOpen(true);
    setUpdatedValue(null);
  };

  // search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (!value) {
      setFilteredData(subMenuMaster);
      return;
    }
    const filteredSubMenu = subMenuMaster?.filter(item =>
      item?.subMenuName?.toLowerCase()?.includes(value)
    );
    setFilteredData(filteredSubMenu);
  };

  // edit handler
  const editHandler = (row: SubMenuItem) => {
    setIsOpen(true);
    setButtonTitle("Update Pane");
    setDrawerTitle("Update Existing Pane");

    const selectedRow = subMenuMaster?.find(data => data?.subMenuId === row?.subMenuId) ?? null;
    setUpdatedValue(selectedRow);
  };

  // page mapping handler
  const pageMappingHandler = () => {
    setOpenPageMapping(true);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen px-3 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Navigation Pane</h1>
            <nav className="text-sm text-gray-500 flex gap-2 mt-1">
              <NavLink to="/dashboard" className="hover:underline">
                Home
              </NavLink>
              <span>››</span>
              <span>Navigation Pane</span>
            </nav>
          </div>

          <div className="flex gap-3 items-center w-full md:w-auto">
            <InputField>
              <input className="input-field" placeholder="Search" onChange={searchHandler} />
            </InputField>
            <button
              className="px-4 py-2 bg-[#1656AD] text-white rounded-lg shadow hover:bg-[#093d6d]"
              onClick={pageMappingHandler}
            >
              Page Mapping
            </button>

            <button
              className="px-4 py-2 bg-[#0b5394] text-white rounded-lg shadow hover:bg-[#093d6d]"
              onClick={AddNewHandler}
            >
              Add New Pane
            </button>
          </div>
        </div>

        <div className="w-full mt-4">
          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className=" w-full table-fixed border-collapse text-sm text-gray-700">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold w-16">Edit</th>

                  {headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-100 transition-colors">
                      <td className="px-4 py-3 text-center" onClick={() => editHandler(row)}>
                        <Edit
                          size={20}
                          className="text-gray-600 hover:text-black cursor-pointer mx-auto"
                        />
                      </td>

                      {headers.map((header, colIndex) => {
                        const key = headerMapping[header];
                        const value = row[key];

                        return (
                          <td key={colIndex} className="px-4 py-3 wrap-break-words">
                            {key === "isActive" ? (
                              value === 1 ? (
                                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                  Inactive
                                </span>
                              )
                            ) : (
                              String(value ?? "")
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length + 1} className="text-center text-gray-500 py-5">
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <CustomLoader isLoading={loading} />}
      </div>

      {isOpen && (
        <NavigationPanelDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          drawerTitle={drawerTitle}
          buttonTitle={buttonTitle}
          onUpdate={getNavigationMenu}
          updatedValue={updatedValue}
        />
      )}
      {/* page mapping drawer */}
      {openPageMapping ? (
        <PageMapping isOpen={openPageMapping} onClose={() => setOpenPageMapping(false)} />
      ) : (
        <></>
      )}
    </>
  );
};

export default NavigationPanel;
