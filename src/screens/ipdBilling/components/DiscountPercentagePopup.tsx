import CentralPopup from "@/components/centralPopup";

type DiscountPercentagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DiscountPercentagePopup = ({ isOpen, onClose }: DiscountPercentagePopupProps) => {
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Discount Percentage">
      <div>this is discount percentage popup</div>
    </CentralPopup>
  );
};

export default DiscountPercentagePopup;
