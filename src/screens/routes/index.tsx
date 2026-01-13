import BranchMaster from "../branchMaster";
import Dashboard from "../dashboard";
import HeaderFooterMaster from "../headerFooterMaster";
import LocationMaster from "../loactionMaster";
import NavigationPanel from "../navigationPanel";
import RoleMaster from "../roleMaster";
import UserAuthorization from "../userAuthorization";
import UserDepartment from "../userDepartment";
import UserGroupMaster from "../userGroupMaster";
import UserMaster from "../userMaster";

export const authorizedRouteMap: Record<string, JSX.Element> = {
  dashboard: <Dashboard />,
  "role-master": <RoleMaster />,
  "user-master": <UserMaster />,
  "user-group": <UserGroupMaster />,
  "user-department": <UserDepartment />,
  "user-authorization": <UserAuthorization />,
  "navigation-pane": <NavigationPanel />,
  "branch-master": <BranchMaster />,
  "location-master": <LocationMaster />,
  "header-footer-master": <HeaderFooterMaster />,
};
