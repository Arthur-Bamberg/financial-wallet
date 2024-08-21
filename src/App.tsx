import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./screens/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/wallet" element={<Wallet />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
