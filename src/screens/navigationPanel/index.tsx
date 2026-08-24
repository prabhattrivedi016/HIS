import { NavigationPaneHeader } from "@/constants/constants";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import NavigationPanelDrawer from "./components/NavigationPanelDrawer";
import PageMapping from "./components/PageMapping";
import SubMenuOrdering from "./components/SubMenuOrdering";
import TabOrdering from "./components/TabOrdering";
import { SubMenuItem } from "./types";

const NavigationPanel = () => {
  const [subMenuMaster, setSubMenuMaster] = useState<SubMenuItem[]>([]);
  const { loading, fetchApi } = useGlobalApi();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [renderNewPane, setRenderNewPane] = useState(false);

  const [filteredData, setFilteredData] = useState<SubMenuItem[]>([]);
  const [drawerTitle, setDrawerTitle] = useState<string>("Add New Pane");
  const [buttonTitle, setButtonTitle] = useState<string>("Create New Pane");
  const [updatedValue, setUpdatedValue] = useState<SubMenuItem | null>(null);
  const [openPageMapping, setOpenPageMapping] = useState<boolean>(false);
  const [renderPageMapping, setRenderPageMapping] = useState<boolean>(false);

  const [openTabOrdering, setOpenTabOrdering] = useState<boolean>(false);
  const [renderTabOrdering, setRenderTabOrdering] = useState<boolean>(false);

  const [openSubMenuOrdering, setOpenSubMenuOrdering] = useState<boolean>(false);
  const [renderSubMenuOrdering, setRenderSubMenuOrdering] = useState<boolean>(false);

  const paneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mappingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // add new pane handler
  const AddNewHandler = () => {
    setUpdatedValue(null);
    setRenderNewPane(true);

    if (paneTimerRef.current) clearTimeout(paneTimerRef.current);

    paneTimerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 10);
  };

  const closePaneHandler = () => {
    setIsOpen(false);

    if (paneTimerRef.current) clearTimeout(paneTimerRef.current);

    paneTimerRef.current = setTimeout(() => {
      setRenderNewPane(false);
    }, 300);
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
    setButtonTitle("Update Pane");
    setDrawerTitle("Update Existing Pane");

    const selectedRow = subMenuMaster?.find(data => data?.subMenuId === row?.subMenuId) ?? null;

    setUpdatedValue(selectedRow);

    setRenderNewPane(true);

    if (paneTimerRef.current) clearTimeout(paneTimerRef.current);

    paneTimerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 5);
  };
  // page mapping handler
  const pageMappingHandler = () => {
    setRenderPageMapping(true);

    if (mappingTimerRef.current) clearTimeout(mappingTimerRef.current);

    mappingTimerRef.current = setTimeout(() => {
      setOpenPageMapping(true);
    }, 10);
  };

  const closeMappingDrawer = () => {
    setOpenPageMapping(false);

    if (mappingTimerRef.current) clearTimeout(mappingTimerRef.current);

    mappingTimerRef.current = setTimeout(() => {
      setRenderPageMapping(false);
    }, 300);
  };

  const tabOrderingHandler = () => {
    setOpenTabOrdering(true);
    setRenderTabOrdering(true);
  };

  const subMenuOrderingHandler = () => {
    setOpenSubMenuOrdering(true);
    setRenderSubMenuOrdering(true);
  };

  const closeTabOrderingHandler = useCallback(() => {
    setOpenTabOrdering(false);
  }, []);

  const closeSubMenuOrderingHandler = useCallback(() => {
    setOpenSubMenuOrdering(false);
  }, []);

  return (
    <div className="page-container">
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

        <div className="flex flex-col sm:flex-row gap-3  items-center w-full md:w-auto ">
          <InputField>
            <input
              className="input-field mt-1"
              placeholder="Search sub-menu name"
              onChange={searchHandler}
            />
          </InputField>
          <button className="save-btn" onClick={tabOrderingHandler}>
            Tab Ordering
          </button>
          <button className="save-btn" onClick={subMenuOrderingHandler}>
            SubMenu Ordering
          </button>
          <button className="save-btn" onClick={pageMappingHandler}>
            Page Mapping
          </button>

          <button className="save-btn" onClick={AddNewHandler}>
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
                      <i className="fa-solid fa-edit icon-color-button" />
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

      {renderNewPane ? (
        <NavigationPanelDrawer
          isOpen={isOpen}
          onClose={closePaneHandler}
          drawerTitle={drawerTitle}
          buttonTitle={buttonTitle}
          onUpdate={getNavigationMenu}
          updatedValue={updatedValue}
        />
      ) : (
        <></>
      )}
      {/* page mapping drawer */}
      {renderPageMapping ? (
        <PageMapping isOpen={openPageMapping} onClose={closeMappingDrawer} />
      ) : (
        <></>
      )}

      {/* tab ordering */}

      {renderTabOrdering ? (
        <TabOrdering isOpen={openTabOrdering} onClose={closeTabOrderingHandler} />
      ) : (
        <></>
      )}

      {/* sub menu ordering */}
      {renderSubMenuOrdering ? (
        <SubMenuOrdering
          isOpen={openSubMenuOrdering}
          onClose={closeSubMenuOrderingHandler}
          onSuccess={getNavigationMenu}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default NavigationPanel;
