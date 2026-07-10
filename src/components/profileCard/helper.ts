import { HandleButtonClickProps } from "./types";

export const handleButtonClick = ({
  btnAction,
  onStatusChange,
  cardLeftTop,
  buttonTitle,
  drawerTitle,
  openDrawer,
  id,
  mapToUser,
  onCustomButtonClick,
}: HandleButtonClickProps) => {
  switch (btnAction) {
    // user master
    case "gridToggleActive": {
      return onStatusChange?.({
        isActive: cardLeftTop[0]?.value === 1 ? 0 : 1,
        userId: id,
      });
    }
    case "gridToggleEdit": {
      buttonTitle?.("Update User");
      drawerTitle?.("Update Existing User");
      openDrawer?.(id);
      return;
    }

    // role master
    case "toggleActive": {
      return onStatusChange?.({
        isActive: cardLeftTop[0]?.value === 1 ? 0 : 1,
        roleId: id,
      });
    }
    case "toggleEdit": {
      openDrawer?.(id);
      return;
    }
    // user group
    case "umgMapToUser": {
      return mapToUser?.(id);
    }
    case "umgGridEdit": {
      buttonTitle?.("Update Group");
      drawerTitle?.("Update Existing Group");
      openDrawer?.(id);
      break;
    }
    // user department
    case "deptToggleActive": {
      return onStatusChange?.({
        isActive: cardLeftTop[0]?.value === 1 ? 0 : 1,
        id: id,
      });
    }

    case "deptToggleEdit": {
      openDrawer?.(id);
      break;
    }
    //branch master
    case "toggleBranchEdit": {
      openDrawer?.(id);
      break;
    }

    //doctor master
    case "toggleDoctorActive": {
      return onStatusChange?.({
        isActive: cardLeftTop[0]?.value === 1 ? 0 : 1,
        doctorId: id,
      });
    }

    case "toggleDoctorEdit": {
      openDrawer?.(id);
      break;
    }

    //refer doctor master

    case "toggleReferDoctorActive": {
      return onStatusChange?.({
        isActive: cardLeftTop[0]?.value === 1 ? 0 : 1,
        referDoctorId: id,
      });
    }

    case "toggleReferDoctorEdit": {
      openDrawer?.(id);
      break;
    }

    // corporate master

    case "toggleCorporateActive": {
      return onStatusChange?.({
        isActive: cardLeftTop[0]?.value === 1 ? 0 : 1,
        corporateId: id,
      });
    }

    case "toggleCorporateEdit": {
      openDrawer?.(id);
      break;
    }

    case "toggleApproveDiscount":
    case "toggleCancelDiscount":
    case "togglePaymentCollection":
    case "toggleCancelPayment": {
      return onCustomButtonClick?.(btnAction, id);
    }

    default:
      break;
  }
};
