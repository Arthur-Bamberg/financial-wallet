/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import styles from "./styles.module.css"; // Certifique-se de que este arquivo contém os estilos atualizados
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
  const { id } = useParams();

  const getWalletData = async (accessToken: string) => {
    try {
      const response = await axios.get<{
        name: string;
        description: string;
        wallets_assets: Asset[];
      }>(`${API_BASE_URL}/wallets/${id}`, {
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
    <div className={styles.loadingContainer}>
      <CircularProgress />
    </div>
  ) : (
    <div className={styles.container}>
      <h1 className={styles.title}>{name}</h1>
      <h2 className={styles.subtitle}>{description}</h2>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#2c2c2c", // Cor de fundo escura para o container da tabela
          borderRadius: "8px",
        }}
      >
        <Table
          sx={{
            width: "100%",
            "& td, & th": {
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
            },
            "& th": {
              backgroundColor: "#3d3d3d",
              fontWeight: "bold",
            },
          }}
        >
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
            {assets.map((asset, index) => (
              <TableRow
                key={asset.asset_id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#2c2c2c" : "#242424",
                  "&:hover": {
                    backgroundColor: "#3a3a3a",
                  },
                }}
              >
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
                    ? (
                        (asset.asset.price / asset.price_ceiling) *
                        100
                      ).toFixed(2) + "%"
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
