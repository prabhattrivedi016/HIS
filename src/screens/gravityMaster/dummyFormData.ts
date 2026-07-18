import { CardSchema } from "@/components/dynamicForm/types";

const billReceiptReprintFormSchema: CardSchema = {
  key: "billReceiptReprint",
  type: "Card",
  title: "Abc",
  controls: [
    {
      key: "uhid",
      label: "UHIS",
      type: "text",
      dataPath: "uhid",
    },
    {
      key: "name",
      label: "Name",
      type: "text",
      dataPath: "name",
    },
    {
      key: "type",
      label: "Type",
      type: "dropdown",
      dataPath: "type",
      options: [
        { label: "All", value: 0 },
        { label: "OPD", value: 1 },
        { label: "IPD", value: 2 },
      ],
    },
    {
      key: "billNumber",
      label: "Bill Number",
      type: "text",
      dataPath: "billNumber",
    },
    {
      key: "receiptNumber",
      label: "Receipt Number",
      type: "text",
      dataPath: "receiptNumber",
    },
    {
      key: "fromDate",
      label: "From Date",
      type: "date",
      dataPath: "fromDate",
    },
    {
      key: "toDate",
      label: "To Date",
      type: "date",
      dataPath: "toDate",
    },
  ],
};

export default billReceiptReprintFormSchema;
