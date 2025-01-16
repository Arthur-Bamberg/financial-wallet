import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import styles from "./styles.module.css";
import { useContext, useState } from "react";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../common/envs";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../../context/WalletContext";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setWallet } = useContext(WalletContext);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const accessToken = response.data.access_token;

      Cookies.set("access_token", accessToken);

      const walletResponse = await axios.get(`${API_BASE_URL}/wallets`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const wallets = walletResponse.data;

      const walletId = wallets[0].id;

      setWallet(walletId);

      setLoading(false);

      navigate(`/wallet/${walletId}`);
    } catch (err) {
      setLoading(false);

      if (err instanceof AxiosError && err.response!.data.message) {
        setError(err.response!.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      }

      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return loading ? (
    <CircularProgress />
  ) : (
    <div className={styles.container}>
      <img src="../../../assets/wallet.png" />
      <h1>Entrar</h1>
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        color="success"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Senha"
        type="password"
        autoComplete="current-password"
        color="success"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" color="success" onClick={handleLogin}>
        Entrar
      </Button>
    </div>
  );
};
