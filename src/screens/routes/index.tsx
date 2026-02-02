import BankMaster from "../bankMaster";
import BranchMaster from "../branchMaster";
import Dashboard from "../dashboard";
import DoctorMaster from "../doctorMaster";
import HeaderFooterMaster from "../headerFooterMaster";
import LocationMaster from "../loactionMaster";
import MrdLocationMaster from "../mrdLocation";
import NavigationPanel from "../navigationPanel";
import RoleMaster from "../roleMaster";
import UserAuthorization from "../userAuthorization";
import UserDepartment from "../userDepartment";
import UserGroupMaster from "../userGroupMaster";
import UserMaster from "../userMaster";
import VendorMaster from "../vendorMaster";

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
  "print-settings": <HeaderFooterMaster />,
  "bank-master": <BankMaster />,
  "vendor-master": <VendorMaster />,
  "mrd-location": <MrdLocationMaster />,
  "doctor-master": <DoctorMaster />,
};
