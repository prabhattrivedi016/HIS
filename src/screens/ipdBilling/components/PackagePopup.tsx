import CentralPopup from "@/components/centralPopup";

type PackagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PackagePopup = ({ isOpen, onClose }: PackagePopupProps) => {
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Package">
      <div>this is package popup</div>
    </CentralPopup>
  );
};

export default PackagePopup;
