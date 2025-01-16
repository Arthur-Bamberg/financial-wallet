import { useContext, useEffect, useState } from "react";
import { BaseAsset } from "../../common/types";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../common/envs";
import {
  Button,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { WalletContext } from "../../context/WalletContext";

export const AddAsset = () => {
  const [baseAssets, setBaseAssets] = useState<BaseAsset[]>([]);
  const [walletAsset, setWalletAsset] = useState({
    asset_id: "",
    price_ceiling: "",
    rank: "",
    bias: "",
    quantity: "",
  });
  const navigate = useNavigate();
  const { wallet } = useContext(WalletContext);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const accessToken = Cookies.get("access_token");

        if (!accessToken) {
          navigate("/");
          return;
        }
        const response = await axios.get<BaseAsset[]>(
          `${API_BASE_URL}/assets`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setBaseAssets(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = Cookies.get("access_token");

      if (!accessToken) {
        navigate("/");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/wallets/${wallet}/assets`,
        {
          ...walletAsset,
          price_ceiling: walletAsset.price_ceiling.trim() != '' ? parseFloat(walletAsset.price_ceiling) : null,
          rank: parseInt(walletAsset.rank),
          quantity: parseInt(walletAsset.quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setWalletAsset({
        asset_id: "",
        price_ceiling: "",
        rank: "",
        bias: "",
        quantity: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      alignItems="center"
      style={{ marginTop: "20px" }}
    >
      <Grid item xs={12} sm={6}>
        <Typography variant="h4" gutterBottom>
          Formulário de Contato
        </Typography>
        <form onSubmit={handleSubmit} >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputLabel id="demo-simple-select-label">Ativo</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={walletAsset.asset_id}
                label="Age"
                onChange={(e) =>
                  setWalletAsset({ ...walletAsset, asset_id: e.target.value })
                }
              >
                {baseAssets.map((asset) => (
                  <MenuItem value={asset.id}>{asset.short_name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preço Teto"
                name="price_ceiling"
                value={walletAsset.price_ceiling}
                onChange={(e) =>
                  setWalletAsset({
                    ...walletAsset,
                    price_ceiling: e.target.value,
                  })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rank"
                name="rank"
                value={walletAsset.rank}
                onChange={(e) =>
                  setWalletAsset({ ...walletAsset, rank: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Viés"
                name="bias"
                value={walletAsset.bias}
                onChange={(e) =>
                  setWalletAsset({ ...walletAsset, bias: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantidade"
                name="quantity"
                value={walletAsset.quantity}
                onChange={(e) =>
                  setWalletAsset({ ...walletAsset, quantity: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Criar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};
