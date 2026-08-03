import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { UserWiseDiscountTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Buttons from "./components/Buttons";
import { UserWiseDiscountItem } from "./types";

const UserWiseDiscountMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [searchName, setSearchName] = useState<string>("");
  const [apiValues, setApiValues] = useState<UserWiseDiscountItem[]>([]);

  // get user wise discount list
  const getUserWiseDiscountList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_DISCOUNT_MASTER,
      {},
      {},
      { component: "UserWiseDiscountMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: userWiseDiscountList = [], refetch } = useQuery({
    queryKey: ["userWiseDiscountList"],
    queryFn: () => getUserWiseDiscountList(),
  });

  //   user search handler
  const searchUserNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(event.target.value.trim());
  };

  useEffect(() => {
    setApiValues(userWiseDiscountList);
  }, [userWiseDiscountList]);

  const filteredUserWiseDiscountList = useMemo(() => {
    if (!searchName) return apiValues;
    return apiValues.filter((item: UserWiseDiscountItem) =>
      item.Name.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [searchName, apiValues]);

  // input change handler
  const inputChangeHandler = (
    e: ChangeEvent<HTMLInputElement>,
    userId: number,
    field: keyof UserWiseDiscountItem
  ) => {
    const value = e.target.value;
    if (Number(value) > 100) {
      showWarning(
        `Discount % of ${
          field === "DiscPerEmergency"
            ? `(Emergency)`
            : field === "DiscPerOPD"
              ? `(OPD)`
              : field === "DiscPerIPD"
                ? `(IPD)`
                : field === "DiscPerDayCare"
                  ? `(Daycare)`
                  : field === "DiscPerDialysis"
                    ? `(Dialysis)`
                    : field === "DiscPerPharmacy"
                      ? `(Pharmacy)`
                      : ""
        } can't be greater than 100%`
      );
      return;
    }

    setApiValues(prev =>
      prev.map(row =>
        row?.UserId === userId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const updateDiscount = async (apiValues: UserWiseDiscountItem[]) => {
    const payload = apiValues.map(i => ({
      userId: i.UserId,
      discPerOPD: Number(i.DiscPerOPD),
      discPerIPD: Number(i.DiscPerIPD),
      discPerPharmacy: Number(i.DiscPerPharmacy),
      discPerDayCare: Number(i.DiscPerDayCare),
      discPerDialysis: Number(i.DiscPerDialysis),
      discPerEmergency: Number(i.DiscPerEmergency),
    }));

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_USER_WISE_DISCOUNT_MASTER,
      payload,
      {},
      { component: "UserWiseDiscountMaster" }
    );
    return resp;
  };

  const mutation = useMutation({
    mutationKey: ["saveDiscount"],

    mutationFn: () => updateDiscount(apiValues),

    onSuccess: async resp => {
      if (!resp?.result) {
        showWarning(resp?.message || "Failed to update discount");
        return;
      }
      await refetch();

      showSuccess(resp?.message ?? "Data saved successfully");
    },

    onError: error => {
      showError(error.message);
    },
  });

  // button click handler
  const buttonClickHandler = (value: string) => {
    switch (value) {
      case "save": {
        mutation.mutate();
        return;
      }
      case "cancel": {
        setApiValues(userWiseDiscountList);
        return;
      }
      default: {
        return [];
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">User Wise Discount Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>User Wise Discount Master</span>
      </nav>

      {/* table data */}
      <div className="table-container ">
        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-150 lg:max-h-300 ">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  {UserWiseDiscountTableHeader.map((h, index) => (
                    <th key={index} className="table-th align-top">
                      <div className="flex flex-row gap-2">
                        <h2>{h}</h2>

                        {h === "User Name" && (
                          <input
                            type="text"
                            placeholder="Search name..."
                            className="input-field lg:max-w-35 lg:max-h-7 "
                            onChange={searchUserNameHandler}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredUserWiseDiscountList.length === 0 && (
                  <tr>
                    <td colSpan={UserWiseDiscountTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {filteredUserWiseDiscountList.map((item: UserWiseDiscountItem, idx: number) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>

                    <td className="table-td">{item?.Name || "-"}</td>
                    <td className="table-td">
                      {
                        <input
                          type="text"
                          className="input-field max-w-25"
                          value={item?.DiscPerOPD}
                          onChange={e => inputChangeHandler(e, item?.UserId, "DiscPerOPD")}
                        />
                      }
                    </td>
                    <td className="table-td">
                      {
                        <input
                          type="text"
                          className="input-field max-w-25"
                          value={item?.DiscPerIPD}
                          onChange={e => inputChangeHandler(e, item?.UserId, "DiscPerIPD")}
                        />
                      }
                    </td>
                    <td className="table-td">
                      {
                        <input
                          type="text"
                          className="input-field max-w-25"
                          value={item?.DiscPerPharmacy}
                          onChange={e => inputChangeHandler(e, item?.UserId, "DiscPerPharmacy")}
                        />
                      }
                    </td>
                    <td className="table-td">
                      {
                        <input
                          type="text"
                          className="input-field max-w-25"
                          value={item?.DiscPerDayCare}
                          onChange={e => inputChangeHandler(e, item?.UserId, "DiscPerDayCare")}
                        />
                      }
                    </td>
                    <td className="table-td">
                      {
                        <input
                          type="text"
                          className="input-field max-w-25"
                          value={item?.DiscPerDialysis}
                          onChange={e => inputChangeHandler(e, item?.UserId, "DiscPerDialysis")}
                        />
                      }
                    </td>
                    <td className="table-td">
                      {
                        <input
                          type="text"
                          className="input-field max-w-25"
                          value={item?.DiscPerEmergency}
                          onChange={e => inputChangeHandler(e, item?.UserId, "DiscPerEmergency")}
                        />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Buttons onButtonClick={buttonClickHandler} />
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default UserWiseDiscountMaster;
