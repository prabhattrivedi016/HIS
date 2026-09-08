import CentralPopup from "@/components/centralPopup";

type RatePopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RatePopup = ({ isOpen, onClose }: RatePopupProps) => {
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Rate">
      <div>this is rate popup</div>
    </CentralPopup>
  );
};

export default RatePopup;
