import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./screens/login";
import { Wallet } from "./screens/wallet";
import { AssetsRecommendation } from "./screens/assets-recommendation";
import { WalletProvider } from "./context/WalletContext";
import { AddAsset } from "./screens/add-asset";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/wallet/:id" element={<Wallet />} />
          <Route
            path="/assets-recommendation/:id"
            element={<AssetsRecommendation />}
          />
          <Route path="add-asset" element={<AddAsset />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
