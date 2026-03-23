export const corporateMasterConfig = {
  type: "corporateMaster",

  gridCardView: {
    type: "corporateMaster",
    cardType: "corporateMasterGrid",
    cardViewType: "grid",

    recordIdKey: "corporateId",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "corporateListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "" }],

    gridId: [{ label: "Corporate Id", keyFromApi: "corporateId" }],

    gridTitle: [{ label: "Corporate Name", keyFromApi: "corporateName" }],

    gridFooterSection: [
      { label: "Code", keyFromApi: "corporateCode" },
      { label: "Starts From", keyFromApi: "contractStartFrom" },
      { label: " Expires On", keyFromApi: "contractExpiresOn" },
    ],

    gridButtonSection: [
      { label: "Active", action: "toggleCorporateActive" },
      { label: "Edit", action: "toggleCorporateEdit" },
    ],
  },

  listCardView: {
    type: "corporateMaster",
    cardType: "corporateMasterList",
    cardViewType: "list",

    recordIdKey: "corporateId",

    listLeftButton: [{ label: "Action", action: "toggleReferDoctorActive" }],

    columns: [
      {
        label: "Corporate Id",
        keyFromApi: "corporateId",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Corporate Name",
        keyFromApi: "corporateName",
        isSortable: true,
        isSearchable: true,
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "Insurance Company", keyFromApi: "insuranceCompanyName" },
      { label: "Corporate Code", keyFromApi: "corporateCode" },
      { label: "Contact 1", keyFromApi: "corporateContact1" },
      { label: "Contact 2", keyFromApi: "corporateContact2" },
      { label: "Email", keyFromApi: "corporateEmail" },
      { label: "Address 1", keyFromApi: "corporateAddress1" },
      { label: "Address 2", keyFromApi: "corporateAddress2" },
      { label: "Start From", keyFromApi: "contractStartFrom" },
      { label: "Expires On", keyFromApi: "contractExpiresOn" },
      { label: "Co-Payment (%)", keyFromApi: "copaymentPer" },
      { label: "Discount (Out Patient)", keyFromApi: "discountPerOut" },
      { label: "Discount (In Patient)", keyFromApi: "discountPerIn" },

      { label: "Hike (Out Patient)", keyFromApi: "hikePerOut" },

      { label: "Hike (In Patient)", keyFromApi: "hikePerIn" },
    ],
  },
};
