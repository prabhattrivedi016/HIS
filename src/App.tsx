import { ToastContainer } from "react-toastify";
import "./index.css";
import Navbar from "./screens/navbar";
import { AssignBranchRightInitializer } from "./store/useAssignBranchRight";

const App = () => {
  return (
    <>
      <AssignBranchRightInitializer />
      <Navbar />
      <ToastContainer position="top-center" newestOnTop theme="colored" pauseOnFocusLoss={false} />
    </>
  );
};

export default App;
