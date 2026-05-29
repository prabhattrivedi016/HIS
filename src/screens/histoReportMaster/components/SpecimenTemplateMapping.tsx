import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SelectItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Select, { GroupBase, MultiValue, SingleValue, StylesConfig } from "react-select";
import InputField from "../../../components/customInputField";
import { HistoTemplateMasterItem, SpecimenMasterItem } from "../types";

const SpecimenTemplateMapping = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [selectedSpecimen, setSelectedSpecimen] = useState<SingleValue<SelectItem> | null>(null);
  const [selectedGrossTemplate, setSelectedGrossTemplate] = useState<MultiValue<SelectItem> | null>(
    []
  );
  const [selectedMicroscopicTemplate, setSelectedMicroscopicTemplate] =
    useState<MultiValue<SelectItem> | null>([]);
  const [selectedImpressionTemplate, setSelectedImpressionTemplate] =
    useState<MultiValue<SelectItem> | null>([]);
  const [isActive, setIsActive] = useState<number>(1);

  // get specimen list
  const getSpecimentLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SPECIMEN_MASTER,
      {},
      {},
      { component: "SpecimenTemplateMapping" }
    );
    const activeFilteredSpecimen = (resp?.data ?? []).filter(
      (item: SpecimenMasterItem) => item.isActive === 1
    );
    return activeFilteredSpecimen;
  };

  // gross template
  const getGrossTemplate = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_HISTO_TEMPLATE_MASTER,
      {},
      { params: { typeId: 1 } },
      { component: "SpecimenTemplateMapping" }
    );
    const activeFilteredGross = (resp?.data ?? []).filter(
      (item: HistoTemplateMasterItem) => item.isActive === 1
    );
    return activeFilteredGross;
  };

  // microscopic template
  const getMicroscopicTemplate = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_HISTO_TEMPLATE_MASTER,
      {},
      { params: { typeId: 2 } },
      { component: "SpecimenTemplateMapping" }
    );
    const activeFilteredMicroscopic = (resp?.data ?? []).filter(
      (item: HistoTemplateMasterItem) => item.isActive === 1
    );
    return activeFilteredMicroscopic;
  };

  // impression template
  const getImpressionTemplate = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_HISTO_TEMPLATE_MASTER,
      {},
      { params: { typeId: 3 } },
      { component: "SpecimenTemplateMapping" }
    );
    const activeFilteredImpression = (resp?.data ?? []).filter(
      (item: HistoTemplateMasterItem) => item.isActive === 1
    );
    return activeFilteredImpression;
  };

  const results = useQueries({
    queries: [
      {
        queryKey: ["specimen_master"],
        queryFn: () => getSpecimentLists(),
      },
      {
        queryKey: ["gross_template"],
        queryFn: () => getGrossTemplate(),
      },
      {
        queryKey: ["microscopic_template"],
        queryFn: () => getMicroscopicTemplate(),
      },
      {
        queryKey: ["impression_template"],
        queryFn: () => getImpressionTemplate(),
      },
    ],
  });

  const [specimenQuery, grossTemplateQuery, microscopicTemplateQuery, impressionTemplateQuery] =
    results;

  const specimenList: SpecimenMasterItem[] = specimenQuery.data ?? [];

  const grossTemplateList: HistoTemplateMasterItem[] = grossTemplateQuery.data ?? [];

  const microscopicTemplateList: HistoTemplateMasterItem[] = microscopicTemplateQuery.data ?? [];

  const impressionTemplateList: HistoTemplateMasterItem[] = impressionTemplateQuery.data ?? [];

  // speciment select list
  const specimenSelectOption = useMemo(() => {
    return specimenList?.map(item => ({
      label: item.specimenName,
      value: item.id,
    }));
  }, [specimenList]);

  // gross template select list
  const grossTemplateSelectOption = useMemo(() => {
    return grossTemplateList?.map(item => ({
      label: item?.name,
      value: item.id,
    }));
  }, [grossTemplateList]);

  // microscopic template select list
  const microscopicTemplateSelectOption = useMemo(() => {
    return microscopicTemplateList?.map(item => ({
      label: item?.name,
      value: item.id,
    }));
  }, [microscopicTemplateList]);

  // impression template select list
  const impressionTemplateSelectOption = useMemo(() => {
    return impressionTemplateList?.map(item => ({
      label: item?.name,
      value: item.id,
    }));
  }, [impressionTemplateList]);

  //select handler
  const selectSpecimenHandler = async (option: SingleValue<SelectItem> | null) => {
    setSelectedSpecimen(option);
    if (!option) {
      setSelectedGrossTemplate([]);
      setSelectedMicroscopicTemplate([]);
      setSelectedImpressionTemplate([]);
      setIsActive(1);
      return;
    }
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SPECIMEN_MAPPING_MASTER,
      {},
      { params: { specimenNameId: option.value } },
      { component: "SpecimenTemplateMapping" }
    );

    const data = Array.isArray(resp?.data) ? resp.data[0] : resp?.data;
    if (data) {
      setIsActive(data.isActive ?? 1);

      const parseIdList = (listStr: string | null | undefined): number[] => {
        if (!listStr) return [];
        return listStr
          .split(",")
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
      };

      const grossIds = parseIdList(data.grossIdList);
      const grossMapped = grossTemplateSelectOption.filter(item => grossIds.includes(item.value));
      setSelectedGrossTemplate(grossMapped);

      const microscopicIds = parseIdList(data.microscopicIdList);
      const microscopicMapped = microscopicTemplateSelectOption.filter(item =>
        microscopicIds.includes(item.value)
      );
      setSelectedMicroscopicTemplate(microscopicMapped);

      const impressionIds = parseIdList(data.impressionIdList);
      const impressionMapped = impressionTemplateSelectOption.filter(item =>
        impressionIds.includes(item.value)
      );
      setSelectedImpressionTemplate(impressionMapped);
    } else {
      setSelectedGrossTemplate([]);
      setSelectedMicroscopicTemplate([]);
      setSelectedImpressionTemplate([]);
      setIsActive(1);
    }
  };
  const selectGrossTemplateHandler = (option: MultiValue<SelectItem> | null) => {
    setSelectedGrossTemplate(option || []);
  };
  const selectMicroscopicTemplateHandler = (option: MultiValue<SelectItem> | null) => {
    setSelectedMicroscopicTemplate(option || []);
  };
  const selectImpressionTemplateHandler = (option: MultiValue<SelectItem> | null) => {
    setSelectedImpressionTemplate(option || []);
  };

  const cancelHandler = () => {
    setSelectedSpecimen(null);
    setSelectedGrossTemplate([]);
    setSelectedMicroscopicTemplate([]);
    setSelectedImpressionTemplate([]);
    setIsActive(1);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecimen) {
      showWarning("Please select a specimen name");
      return;
    }

    const payload = {
      specimenNameId: selectedSpecimen.value,
      grossIdList: selectedGrossTemplate
        ? selectedGrossTemplate.map(item => item.value).join(",")
        : "",
      microscopicIdList: selectedMicroscopicTemplate
        ? selectedMicroscopicTemplate.map(item => item.value).join(",")
        : "",
      impressionIdList: selectedImpressionTemplate
        ? selectedImpressionTemplate.map(item => item.value).join(",")
        : "",
      isActive,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SPECIMEN_MAPPING_MASTER,
      payload,
      {},
      { component: "SpecimenTemplateMapping" }
    );

    if (resp?.result) {
      showSuccess(resp?.message ?? "Data updated successfully");
    } else {
      showWarning(resp?.message ?? "Something went wrong");
    }
    setSelectedSpecimen(null);
    setSelectedGrossTemplate([]);
    setSelectedMicroscopicTemplate([]);
    setSelectedImpressionTemplate([]);
    setIsActive(1);
  };

  const isQueriesLoading = results.some(q => q.isLoading);

  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* form data */}
        <form onSubmit={onSubmit}>
          <div className="form-grid-4">
            <InputField label="Specimen Name" required>
              <Select
                value={selectedSpecimen}
                options={specimenSelectOption}
                placeholder="Select specimen name"
                isSearchable
                isClearable
                onChange={(option: any) => selectSpecimenHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Gross Template">
              <Select
                value={selectedGrossTemplate}
                isMulti
                options={grossTemplateSelectOption}
                placeholder="Select gross template"
                isSearchable
                isClearable
                onChange={(option: any) => selectGrossTemplateHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Microscopic Template">
              <Select
                value={selectedMicroscopicTemplate}
                isMulti
                options={microscopicTemplateSelectOption}
                placeholder="Select microscopic template"
                isSearchable
                isClearable
                onChange={(option: any) => selectMicroscopicTemplateHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Impression Template">
              <Select
                value={selectedImpressionTemplate}
                isMulti
                options={impressionTemplateSelectOption}
                placeholder="Select impression template"
                isSearchable
                isClearable
                onChange={(option: any) => selectImpressionTemplateHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Status" required>
              <select
                className="input-field"
                value={isActive}
                onChange={e => setIsActive(Number(e.target.value))}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn" disabled={loading}>
              Update
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {(loading || isQueriesLoading) && <CustomLoader isLoading={true} />}
    </div>
  );
};

export default SpecimenTemplateMapping;
