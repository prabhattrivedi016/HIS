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
}: HandleButtonClickProps) => {
  switch (btnAction) {
    // user master
    case "gridToggleActive": {
      return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, userId: id });
    }
    case "gridToggleEdit": {
      buttonTitle("Update User");
      drawerTitle("Update Existing User");
      openDrawer(id);
      return;
    }

    // role master
    case "toggleActive": {
      return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, roleId: id });
    }
    case "toggleEdit": {
      buttonTitle("Update Role");
      drawerTitle("Update Existing Role");
      openDrawer(id);
      return;
    }
    // user group
    case "umgMapToUser": {
      return mapToUser?.(id);
    }
    case "umgGridEdit": {
      buttonTitle("Update Group");
      drawerTitle("Update Existing Group");
      openDrawer(id);
    }
    // user department
    case "deptToggleActive": {
      return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, id: id });
    }

    case "deptToggleEdit": {
      buttonTitle("Update Department");
      drawerTitle("Update Existing Department");
      openDrawer(id);
    }
  }
};
