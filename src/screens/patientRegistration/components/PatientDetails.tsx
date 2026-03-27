import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAgeFromDob = (dobValue: string) => {
  const birthDate = new Date(`${dobValue}T00:00:00`);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
};

const normalizePickValue = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const TITLE_ALIASES: Record<string, string[]> = {
  mr: ["mr", "mister"],
  mrs: ["mrs", "misses", "mistress"],
  miss: ["miss", "ms"],
  master: ["master"],
  bo: ["bo", "babyof", "sonof", "daughterof", "wardof", "careof", "co"],
  dr: ["dr", "doctor", "doc"],
  mx: ["mx"],
};

const resolveTitleToken = (token: string) => {
  const normalizedToken = normalizePickValue(token);
  for (const [canonical, aliases] of Object.entries(TITLE_ALIASES)) {
    if (aliases.includes(normalizedToken)) return canonical;
  }
  return normalizedToken;
};

type PatientDetailsProps = {
  resetSignal?: number;
};

const PatientDetails = ({ resetSignal = 0 }: PatientDetailsProps) => {
  const currentDate = toLocalDateString(new Date());

  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const isUpdating = useRef(false);

  // LOCAL STATE
  const [dob, setDob] = useState("");
  const [age, setAge] = useState({
    years: "",
    months: "",
    days: "",
  });

  // api
  const title = usePickMaster("title");
  const titleList = title?.pickMasterValue ?? [];

  const gender = usePickMaster("gender");
  const genderList = gender?.pickMasterValue ?? [];

  useEffect(() => {
    if (!titleList.length) return;
    const defaultTitle = titleList.find(t => t?.value === "Mr.");
    if (defaultTitle && !getValues("Title")) {
      setValue("Title", defaultTitle.value);
    }
  }, [titleList, setValue, getValues]);

  useEffect(() => {
    setDob("");
    setAge({
      years: "",
      months: "",
      days: "",
    });

    const defaultTitle = titleList.find(t => t?.value === "Mr.");
    if (defaultTitle) {
      setValue("Title", defaultTitle.value, { shouldValidate: false, shouldDirty: false });
    }
  }, [resetSignal, setValue, titleList]);

  const watchedDob = watch("Dob");
  const watchedAgeYears = watch("AgeYears");
  const watchedAgeMonths = watch("AgeMonths");
  const watchedAgeDays = watch("AgeDays");
  const watchedTitle = watch("Title");
  const watchedGender = watch("Gender");

  useEffect(() => {
    if (isUpdating.current) return;

    setDob(watchedDob ? String(watchedDob) : "");
    setAge({
      years:
        watchedAgeYears === 0 || watchedAgeYears ? String(watchedAgeYears) : "",
      months:
        watchedAgeMonths === 0 || watchedAgeMonths ? String(watchedAgeMonths) : "",
      days: watchedAgeDays === 0 || watchedAgeDays ? String(watchedAgeDays) : "",
    });
  }, [watchedDob, watchedAgeYears, watchedAgeMonths, watchedAgeDays]);

  useEffect(() => {
    if (!watchedTitle || !titleList.length) return;

    const normalizedTitle = resolveTitleToken(String(watchedTitle));
    const matchedTitle = titleList.find(
      option => resolveTitleToken(String(option?.value ?? "")) === normalizedTitle
    );

    if (matchedTitle?.value && matchedTitle.value !== watchedTitle) {
      setValue("Title", matchedTitle.value, { shouldValidate: true, shouldDirty: false });
    }
  }, [watchedTitle, titleList, setValue]);

  useEffect(() => {
    if (!watchedGender || !genderList.length) return;

    const normalizedGender = normalizePickValue(watchedGender);
    const matchedGender = genderList.find(
      option => normalizePickValue(option?.value) === normalizedGender
    );

    if (matchedGender?.value && matchedGender.value !== watchedGender) {
      setValue("Gender", matchedGender.value, { shouldValidate: true, shouldDirty: false });
    }
  }, [watchedGender, genderList, setValue]);

  const handleDobChange = (value: string) => {
    if (!value || isUpdating.current) return;
    const nextAge = getAgeFromDob(value);
    if (!nextAge) return;

    if (
      value === dob &&
      nextAge.years === Number(age.years) &&
      nextAge.months === Number(age.months) &&
      nextAge.days === Number(age.days)
    ) {
      return;
    }

    isUpdating.current = true;

    setDob(value);
    setAge({
      years: String(nextAge.years),
      months: String(nextAge.months),
      days: String(nextAge.days),
    });

    setValue("Dob", value, { shouldValidate: true, shouldDirty: true });
    setValue("AgeYears", nextAge.years, { shouldValidate: true, shouldDirty: true });
    setValue("AgeMonths", nextAge.months, { shouldValidate: true, shouldDirty: true });
    setValue("AgeDays", nextAge.days, { shouldValidate: true, shouldDirty: true });

    isUpdating.current = false;
  };

  const handleAgeChange = (type: "years" | "months" | "days", val: string) => {
    const numeric = val.replace(/\D/g, "");

    const updatedAge = {
      ...age,
      [type]: numeric,
    };

    setAge(updatedAge);

    if (isUpdating.current) return;

    const today = new Date();

    const years = Number(updatedAge.years || 0);
    const months = Number(updatedAge.months || 0);
    const days = Number(updatedAge.days || 0);

    let birthDate = new Date(today);

    birthDate.setFullYear(birthDate.getFullYear() - years);
    birthDate.setMonth(birthDate.getMonth() - months);
    birthDate.setDate(birthDate.getDate() - days);

    if (isNaN(birthDate.getTime())) return;

    const formattedDOB = toLocalDateString(birthDate);
    setValue("AgeYears", years, { shouldValidate: true, shouldDirty: true });
    setValue("AgeMonths", months, { shouldValidate: true, shouldDirty: true });
    setValue("AgeDays", days, { shouldValidate: true, shouldDirty: true });

    if (formattedDOB === (dob || "")) return;

    isUpdating.current = true;

    setDob(formattedDOB);

    setValue("Dob", formattedDOB, { shouldValidate: true, shouldDirty: true });

    isUpdating.current = false;
  };
  return (
    <div className="form-grid-3 card -mt-3">
      <div className="flex gap-2 w-full">
        <div className="w-1/3">
          <InputField label="Title">
            <select className="input-field" {...register("Title")}>
              <option value="">Select</option>
              {titleList.map((t, idx) => (
                <option key={idx} value={t?.value}>
                  {t?.value}
                </option>
              ))}
            </select>
          </InputField>
        </div>

        <div className="w-2/3">
          <InputField label="First Name" required>
            <input type="text" className="input-field" {...register("FirstName")} />
            {errors.FirstName && (
              <p className="input-field-error">{String(errors.FirstName.message)}</p>
            )}
          </InputField>
        </div>
      </div>

      <InputField label="Middle Name">
        <input type="text" className="input-field w-full" {...register("MiddleName")} />
      </InputField>

      <InputField label="Last Name">
        <input type="text" className="input-field w-full" {...register("LastName")} />
      </InputField>

      <div className="flex gap-2 w-full">
        <InputField label="Age (years)" required>
          <input
            className="input-field"
            value={age.years}
            onChange={e => handleAgeChange("years", e.target.value)}
          />
          {errors.AgeYears && (
            <p className="input-field-error">{String(errors.AgeYears.message)}</p>
          )}
        </InputField>

        <InputField label="Months" required>
          <input
            className="input-field"
            value={age.months}
            onChange={e => handleAgeChange("months", e.target.value)}
          />
          {errors.AgeMonths && (
            <p className="input-field-error">{String(errors.AgeMonths.message)}</p>
          )}
        </InputField>

        <InputField label="Days" required>
          <input
            className="input-field"
            value={age.days}
            onChange={e => handleAgeChange("days", e.target.value)}
          />
          {errors.AgeDays && <p className="input-field-error">{String(errors.AgeDays.message)}</p>}
        </InputField>
      </div>

      <InputField label="DOB" required>
        <CustomDateInput value={dob} max={currentDate} onChange={date => handleDobChange(date)} />
        {errors.Dob && <p className="input-field-error">{String(errors.Dob.message)}</p>}
      </InputField>

      <InputField label="Gender" required>
        <select className="input-field" {...register("Gender")}>
          <option value="">Select</option>
          {genderList?.map(g => (
            <option key={g?.key} value={g?.value}>
              {g?.value}
            </option>
          ))}
        </select>
        {errors.Gender && <p className="input-field-error">{String(errors.Gender.message)}</p>}
      </InputField>
    </div>
  );
};

export default PatientDetails;
