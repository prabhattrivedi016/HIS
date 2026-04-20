import "./index.css";
import { ToastContainer } from "react-toastify";
import Navbar from "./screens/navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-center"
        newestOnTop
        theme="colored"
        pauseOnFocusLoss={false}
      />
    </>
  );
};

export default App;
