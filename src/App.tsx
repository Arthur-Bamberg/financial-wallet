import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./screens/login";
import { Wallet } from "./screens/wallet";
import { AssetsRecommendation } from "./screens/assets-recommendation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/wallet/:id" element={<Wallet />} />
        <Route path="/assets-recommendation/:id" element={<AssetsRecommendation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
