import CreateAbhaModal from "./CreateAbhaModal";
import VerifyAbhaModal from "./VerifyAbhaModal";

type Props = {
  showVerify: boolean;
  showCreate: boolean;
  onCloseVerify: () => void;
  onCloseCreate: () => void;
  onBindPatient: (mapped: Record<string, unknown>) => void;
};

const AbhaCreationVerificationView = ({
  showVerify,
  showCreate,
  onCloseVerify,
  onCloseCreate,
  onBindPatient,
}: Props) => (
  <>
    <VerifyAbhaModal isOpen={showVerify} onClose={onCloseVerify} onBindPatient={onBindPatient} />
    <CreateAbhaModal isOpen={showCreate} onClose={onCloseCreate} onBindPatient={onBindPatient} />
  </>
);

export default AbhaCreationVerificationView;
