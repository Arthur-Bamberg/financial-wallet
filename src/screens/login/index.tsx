import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import styles from "./styles.module.css";
import { useState } from "react";
import Cookies from 'js-cookie';
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../common/envs";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      Cookies.set('access_token', response.data.access_token);

      setLoading(false);
      
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
      <AccountBalanceWalletIcon
        style={{ fontSize: 150, color: "#6B2504", margin: "0 auto" }}
      />
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Senha"
        type="password"
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Entrar
      </Button>
    </div>
  );
};
