/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import styles from './styles.module.css'; // Certifique-se de que este arquivo contém os estilos atualizados
import axios from 'axios';
import { API_BASE_URL } from '../../common/envs';
import { Asset } from '../../common/types';

export const Wallet = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const navigate = useNavigate();
  const { id } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleConfirmEdit = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      if (!accessToken) {
        navigate('/');
        return;
      }

      await axios.put(
        `${API_BASE_URL}/wallets/${id}`,
        {
          name: editedName,
          description: editedDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setName(editedName);
      setDescription(editedDescription);

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(name);
    setEditedDescription(description);
  };

  useEffect(() => {
    setLoading(true);

    const access_token = Cookies.get('access_token');

    if (!access_token) {
      navigate('/');
      return;
    }

    getWalletData(access_token);
  }, [navigate]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatPercentage = (value: number): string => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  return loading ? (
    <div className={styles.loadingContainer}>
      <CircularProgress />
    </div>
  ) : (
    <div className={styles.container}>
      {isEditing ? (
        <>
          <TextField
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            label="Nome"
            variant="outlined"
            className={styles.textField}
            InputProps={{ style: { color: '#ffffff' } }}
            InputLabelProps={{ style: { color: '#ffffff' } }}
          />
          <TextField
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            label="Descrição"
            variant="outlined"
            className={styles.textField}
            InputProps={{ style: { color: '#ffffff' } }}
            InputLabelProps={{ style: { color: '#ffffff' } }}
            multiline
            rows={2}
          />
          <div className={styles.buttonContainer}>
            <Button variant="contained" color="primary" onClick={handleConfirmEdit}>
              Confirmar
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <Typography variant="h4" className={styles.title}>
              {name}
            </Typography>
            <div className={styles.buttonGroup}>
              <IconButton
                onClick={() => {
                  setEditedName(name);
                  setEditedDescription(description);
                  setIsEditing(true);
                }}
                className={styles.editButton}
              >
                <EditIcon style={{ color: '#ffffff' }} />
              </IconButton>

              {/* Novo botão para recomendações */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate(`/assets-recommendation/${id}`)}
                className={styles.recommendButton}
                style={{ marginLeft: '10px' }}
              >
                Ver Recomendação de Ativos
              </Button>
            </div>
          </div>
          <Typography variant="h6" className={styles.subtitle}>
            {description}
          </Typography>
        </>
      )}
      <Typography variant="h5" className={styles.totalValue}>
        Total em Ativos: {formatCurrency(totalValue)}
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: '#2c2c2c',
          borderRadius: '8px',
          overflowX: 'auto',
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            '& td, & th': {
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            },
            '& th': {
              backgroundColor: '#3d3d3d',
              fontWeight: 'bold',
            },
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              {!isMobile && (
                <>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Valor Individual</TableCell>
                  <TableCell>Preço Teto</TableCell>
                  <TableCell>% Teto</TableCell>
                  <TableCell>Viés</TableCell>
                </>
              )}
              <TableCell>Valor Total</TableCell>
              {!isMobile && <TableCell>% Carteira</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset, index) => (
              <TableRow
                key={asset.asset_id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#2c2c2c' : '#242424',
                  '&:hover': {
                    backgroundColor: '#3a3a3a',
                  },
                }}
              >
                <TableCell>{asset.rank + '°'}</TableCell>
                <TableCell>{asset.asset.short_name}</TableCell>
                <TableCell>{asset.asset.type.name}</TableCell>
                {!isMobile && (
                  <>
                    <TableCell>{asset.quantity}</TableCell>
                    <TableCell>{formatCurrency(asset.asset.price)}</TableCell>
                    <TableCell>
                      {asset.price_ceiling ? formatCurrency(asset.price_ceiling) : '-'}
                    </TableCell>
                    <TableCell>
                      {asset.price_ceiling
                        ? formatPercentage((asset.asset.price / asset.price_ceiling) * 100)
                        : '-'}
                    </TableCell>
                    <TableCell>{asset.bias}</TableCell>
                  </>
                )}
                <TableCell>{formatCurrency(asset.asset.price * asset.quantity)}</TableCell>
                {!isMobile && (
                  <TableCell>
                    {formatPercentage((asset.asset.price * asset.quantity * 100) / totalValue)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
