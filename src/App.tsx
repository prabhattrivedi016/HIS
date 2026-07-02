import { ToastContainer } from "react-toastify";
import "./index.css";
import Navbar from "./screens/navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" newestOnTop theme="colored" pauseOnFocusLoss={false} />
    </>
  );
};

export default App;
