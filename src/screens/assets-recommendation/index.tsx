import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  createTheme,
  CircularProgress,
} from "@mui/material";
import "./styles.module.css";
import Cookies from 'js-cookie';
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../common/envs";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

type Asset = {
  id: number;
  asset_id: number;
  wallet_id: number;
  price_ceiling: number;
  rank: number;
  bias: "Comprar" | "Vender" | "Manter";
  quantity: number;
  created_at: string;
  updated_at: string;
  asset: {
    id: number;
    short_name: string;
    full_name: string;
    price: number;
    type_id: number;
    created_at: string;
    updated_at: string;
    type: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
  };
};

export const AssetsRecommendation = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInvest, setTotalInvest] = useState<number>(0);
  const [numAssets, setNumAssets] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<
    {
      id: number;
      name: string;
      unitsToBuy: number;
      remainingQuantity: number;
      totalValue: number;
    }[]
  >([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);

        const accessToken = Cookies.get('access_token');

        if (!accessToken) {
          navigate('/');
          return;
        }
        const response = await axios.get<{
          name: string;
          description: string;
          wallets_assets: Asset[];
        }>(`${API_BASE_URL}/wallets/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setAssets(response.data.wallets_assets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredAssets = assets.filter((asset) => asset.bias === "Comprar");
    const sortedAssets = filteredAssets.sort((a, b) => {
      const aValue = a.asset.price * a.quantity;
      const bValue = b.asset.price * b.quantity;
      return aValue - bValue;
    });

    const selectedAssets = sortedAssets.slice(0, numAssets);
    const amountPerAsset = totalInvest / numAssets;

    const recs = selectedAssets.map((asset) => {
      const unitsToBuy = Math.floor(amountPerAsset / asset.asset.price);
      const totalValue = unitsToBuy * asset.asset.price;
      const remainingQuantity = asset.quantity + unitsToBuy;
      return {
        id: asset.asset.id,
        name: asset.asset.short_name,
        unitsToBuy,
        remainingQuantity,
        totalValue,
      };
    });

    setRecommendations(recs);
  };

  if (loading)  return 
    <div className="loadingContainer">
      <CircularProgress />
    </div>

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="md" className="container">
        <Typography variant="h4" gutterBottom>
          Recomendação de Ativos
        </Typography>
        <form onSubmit={handleSubmit} className="form">
          <TextField
            label="Valor Total para Investir"
            type="number"
            value={totalInvest}
            onChange={(e) => setTotalInvest(Number(e.target.value))}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantidade de Ativos Diferentes"
            type="number"
            value={numAssets}
            onChange={(e) => setNumAssets(Number(e.target.value))}
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="submit-button"
          >
            Obter Recomendações
          </Button>
        </form>
        {recommendations.length > 0 && (
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID do Ativo</TableCell>
                  <TableCell>Nome do Ativo</TableCell>
                  <TableCell>Quantidade a Comprar</TableCell>
                  <TableCell>Quantidade Restante</TableCell>
                  <TableCell>Valor Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.id}</TableCell>
                    <TableCell>{rec.name}</TableCell>
                    <TableCell>{rec.unitsToBuy}</TableCell>
                    <TableCell>{rec.remainingQuantity}</TableCell>
                    <TableCell>{rec.totalValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </ThemeProvider>
  );
};