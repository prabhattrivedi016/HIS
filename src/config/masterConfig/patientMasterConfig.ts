export const patientMasterConfig = {
  type: "patientMaster",

  gridCardView: {
    type: "patientMaster",
    cardType: "patientMasterGrid",
    cardViewType: "grid",

    recordIdKey: "patientId",

    gridLeftTop: [{ label: "InOutPatient", keyFromApi: "isInPatient" }],

    gridRightTop: [{ label: "toggle", action: "patientMasterToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "patientImagePath" }],

    gridId: [{ label: "Patient Id", keyFromApi: "patientId" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "patientName" }],

    gridFooterSection: [
      { label: "Gender", keyFromApi: "gender" },
      { label: "Contact No.", keyFromApi: "contactNumber" },
      { label: " UHID", keyFromApi: "uhid" },
    ],

    gridButtonSection: [
      { label: "Opd Billing", action: "togglePatientOpdBilling" },
      { label: "Edit", action: "togglePatientEdit" },
    ],
  },

  listCardView: {
    type: "patientMaster",
    cardType: "patientMasterList",
    cardViewType: "list",

    recordIdKey: "patientId",

    listLeftButton: [{ label: "Action", action: "togglePatientMasterActive" }],

    columns: [
      {
        label: "Patient Id",
        keyFromApi: "patientId",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Patient Name",
        keyFromApi: "patientName",
        isSortable: true,
        isSearchable: true,
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "UHID", keyFromApi: "uhid" },
      { label: " Title", keyFromApi: "title" },
      { label: "First Name", keyFromApi: "firstName" },
      { label: "Middle Name", keyFromApi: "middleName" },
      { label: "Last Name", keyFromApi: "lastName" },
      { label: "Age", keyFromApi: "age" },
      { label: "DOB", keyFromApi: "dob" },
      { label: "Gender", keyFromApi: "gender" },
      { label: "Marital Status", keyFromApi: "maritalStatus" },
      { label: "Relation", keyFromApi: "relation" },
      { label: "Relative Name", keyFromApi: "relativeName" },
      { label: "Id Proof Name", keyFromApi: "idProofName" },

      { label: "ID Proof Number", keyFromApi: "idProofNumber" },

      { label: "Contact Number", keyFromApi: "contactNumber" },
      { label: "Emergency Contact Number", keyFromApi: "emergencyContactNumber" },
      { label: "Email", keyFromApi: "email" },
      { label: "Privileged Card Number", keyFromApi: "privilegedCardNumber" },
      { label: "Address", keyFromApi: "address" },
      { label: "State", keyFromApi: "state" },
      { label: "District", keyFromApi: "district" },
      { label: "Card No.", keyFromApi: "cardNo" },
      { label: "Policy No.", keyFromApi: "policyNo" },
      { label: "Policy Card No.", keyFromApi: "policyCardNo" },
      { label: "Expiry Date", keyFromApi: "expiryDate" },
      { label: "Card Holder", keyFromApi: "cardHolder" },
      { label: "Referral No.", keyFromApi: "referalNo" },
      { label: "Referral Date.", keyFromApi: "referalDate" },
    ],
  },
};
