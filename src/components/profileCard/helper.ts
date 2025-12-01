export const handleButtonClick = ({
  btnAction,
  onStatusChange,
  cardLeftTop,
  buttonTitle,
  drawerTitle,
  openDrawer,
  id,
}) => {
  switch (btnAction) {
    case "gridToggleActive": {
      return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, userId: id });
    }

    case "toggleActive": {
      return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, roleId: id });
    }
    case "umgGridActive": {
      return onStatusChange({ isActive: cardLeftTop[0]?.value === 1 ? 0 : 1, id: id });
    }

    case "gridToggleEdit": {
      buttonTitle("Update User");
      drawerTitle("Update Existing User");
      openDrawer(id);

      return;
    }

    case "toggleEdit": {
      buttonTitle("Update Role");
      drawerTitle("Update Existing Role");
      openDrawer(id);
      return;
    }

    case "umgGridEdit": {
      buttonTitle("Update Group");
      drawerTitle("Update Existing Group");
      openDrawer(id);
    }
  }
};
