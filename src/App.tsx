import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./screens/login";
import { Wallet } from "./screens/wallet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/wallet/:id" element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
