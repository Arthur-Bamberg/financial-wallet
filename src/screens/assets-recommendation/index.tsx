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
import { Asset } from "../../common/types";
import { formatCurrency } from "../../common/utils";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const AssetsRecommendation = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInvest, setTotalInvest] = useState<number>(0);
  const [numAssets, setNumAssets] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<
    (Asset & {
      unitsToBuy: number;
      remainingQuantity: number;
      totalValue: number;
    })[]
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
    // Usar todos os ativos disponíveis
    const sortedAssets = [...assets].sort((a, b) => {
      const aValue = a.asset.price * a.quantity;
      const bValue = b.asset.price * b.quantity;
      return aValue - bValue;
    });

    const selectedAssets = sortedAssets.slice(0, numAssets);
    const amountPerAsset = (totalInvest / numAssets) * 1.10; // Incluindo 10% de tolerância

    const recs = selectedAssets.map((asset) => {
      const unitsToBuy = Math.floor(amountPerAsset / asset.asset.price);
      const totalValue = unitsToBuy * asset.asset.price;
      const remainingQuantity = asset.quantity + unitsToBuy;
      return {
        ...asset,
        unitsToBuy,
        remainingQuantity,
        totalValue,
      };
    });

    setRecommendations(recs);
  };

  const handleExecuteRecommendations = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      if (!accessToken) {
        navigate('/');
        return;
      }

      for (const rec of recommendations) {
        await axios.patch(
          `${API_BASE_URL}/wallets/${id}/assets/${rec.asset.id}`,
          { quantity: rec.remainingQuantity },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      alert('Recomendações executadas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao executar recomendações.');
    }
  };

  if (loading)
    return (
      <div className="loadingContainer">
        <CircularProgress />
      </div>
    );

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="lg" className="container">
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
          <>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Preço Teto</TableCell>
                    <TableCell>Quantidade Atual</TableCell>
                    <TableCell>Quantidade a Comprar</TableCell>
                    <TableCell>Nova Quantidade</TableCell>
                    <TableCell>Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((rec) => (
                    <TableRow key={rec.asset.id}>
                      <TableCell>{rec.asset.short_name}</TableCell>
                      <TableCell>{formatCurrency(rec.asset.price)}</TableCell>
                      <TableCell>{formatCurrency(rec.price_ceiling)}</TableCell>
                      <TableCell>{rec.quantity}</TableCell>
                      <TableCell>{rec.unitsToBuy}</TableCell>
                      <TableCell>{rec.remainingQuantity}</TableCell>
                      <TableCell>{formatCurrency(rec.totalValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleExecuteRecommendations}
              style={{ marginTop: "10px" }}
            >
              Executar Recomendações
            </Button>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};
