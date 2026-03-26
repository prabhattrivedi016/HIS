const SaveButtons = () => {
  return (
    <div className="z-10 bg-gray-50  m-1">
      <div className="form-actions-responsive flex-wrap gap-2 justify-end">
        <button type="submit" className="save-btn whitespace-nowrap">
          Save
        </button>
        <button type="submit" className="save-btn whitespace-nowrap">
          Billing
        </button>
        <button type="submit" className="save-btn whitespace-nowrap">
          Admission
        </button>
        <button type="submit" className="save-btn whitespace-nowrap">
          Emergency Admission
        </button>

        <button type="submit" className="save-btn whitespace-nowrap">
          Dialysis Admission
        </button>

        <button type="submit" className="save-btn whitespace-nowrap">
          Daycare Admission
        </button>
        <button type="submit" className="save-btn whitespace-nowrap">
          OPD Consultation
        </button>
        <button type="button" className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SaveButtons;
