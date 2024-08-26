/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./styles.module.css";
import axios from "axios";
import { API_BASE_URL } from "../../common/envs";
import { Asset } from "../../common/types";

export const Wallet = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const navigate = useNavigate();

  const getWalletData = async (accessToken: string) => {
    try {
      const { id } = useParams();

      const response = await axios.get<{
        name: string;
        description: string;
        wallets_assets: Asset[];
      }>(`${API_BASE_URL}/wallets/1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let totalValue = 0;

      for (const walletAsset of response.data.wallets_assets) {
        const assetValue = walletAsset.asset.price * walletAsset.quantity;
        totalValue += assetValue;
      }

      setName(response.data.name);
      setDescription(response.data.description);
      setAssets(response.data.wallets_assets);
      setTotalValue(totalValue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    const access_token = Cookies.get("access_token");

    if (!access_token) {
      navigate("/");
      return;
    }

    getWalletData(access_token);
  }, [navigate]);

  return loading ? (
    <CircularProgress />
  ) : (
    <div className={styles.container}>
      <h1>{name}</h1>
      <h2>{description}</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Valor Individual</TableCell>
              <TableCell>Preço Teto</TableCell>
              <TableCell>% Teto</TableCell>
              <TableCell>Viés</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>% Carteira</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.asset_id}>
                <TableCell>{asset.rank + "°"}</TableCell>
                <TableCell>{asset.asset.short_name}</TableCell>
                <TableCell>{asset.asset.type.name}</TableCell>
                <TableCell>{asset.quantity}</TableCell>
                <TableCell>{"R$ " + asset.asset.price}</TableCell>
                <TableCell>
                  {asset.price_ceiling ? "R$ " + asset.price_ceiling : "-"}
                </TableCell>
                <TableCell>
                  {asset.price_ceiling
                    ? ((asset.asset.price / asset.price_ceiling) * 100).toFixed(
                        2
                      ) + "%"
                    : "-"}
                </TableCell>
                <TableCell>{asset.bias}</TableCell>
                <TableCell>
                  {"R$ " + (asset.asset.price * asset.quantity).toFixed(2)}
                </TableCell>
                <TableCell>
                  {(
                    (asset.asset.price * asset.quantity * 100) /
                    totalValue
                  ).toFixed(2) + "%"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
