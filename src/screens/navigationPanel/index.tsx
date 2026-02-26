import { NavigationPaneHeader } from "@/constants/constants";
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

  // map UI NavigationPaneHeader to API keys
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
      <div className="page-container sm:mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div>
            <h1 className="page-heading">Navigation Pane</h1>

            <nav className="helper-text">
              <NavLink to="/dashboard" className="hover:underline">
                Home
              </NavLink>
              <span>››</span>
              <span>Navigation Pane</span>
            </nav>
          </div>

          <div className="flex gap-3 items-center w-full md:w-auto">
            <InputField>
              <input
                className="input-field"
                placeholder="Search sub-menu name"
                onChange={searchHandler}
              />
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

        {/* <div className="card"> */}
        <div className="table-container sm:mt-4">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-155 lg:max-h-155">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {/* Edit Column */}
                    <th className="table-th w-16">Edit</th>

                    {NavigationPaneHeader.map((header, index) => (
                      <th key={index} className="table-th whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredData?.length === 0 && (
                    <tr>
                      <td colSpan={NavigationPaneHeader?.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td text-center" onClick={() => editHandler(item)}>
                        <i className="fa-solid fa-edit text-blue-500 text-lg cursor-pointer active:scale-90" />
                      </td>

                      <td className="table-td">{item?.tabName || "-"}</td>

                      <td className="table-td">{item?.subMenuName || "-"}</td>

                      <td className="table-td">{item?.url || "-"}</td>

                      <td
                        className={`table-td ${
                          Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                      </td>
                      <td className="table-td">{item?.ipAddress || "-"}</td>
                      {/* <td className="table-td">{item?.createdBy || "-"}</td>
                        <td className="table-td">{item?.createdOn || "-"}</td>
                        <td className="table-td">{item?.lastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.lastModifiedOn || "-"}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* </div> */}
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
