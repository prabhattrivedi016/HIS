import CentralPopup from "@/components/centralPopup";

type DiscountAmountPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DiscountAmountPopup = ({ isOpen, onClose }: DiscountAmountPopupProps) => {
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Discount Amount">
      <div>this is discount amount popup</div>
    </CentralPopup>
  );
};

export default DiscountAmountPopup;
