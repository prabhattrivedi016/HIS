import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import Navbar from "./screens/navbar";

const App = () => (
  <ThemeProvider>
    <div>
      <Navbar />
    </div>
  </ThemeProvider>
);

export default App;
