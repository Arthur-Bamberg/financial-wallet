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
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import styles from './styles.module.css';
import axios from 'axios';
import { API_BASE_URL } from '../../common/envs';
import { Asset } from '../../common/types';
import { formatCurrency, formatPercentage } from '../../common/utils';

export const Wallet = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const [editingRow, setEditingRow] = useState<number>(0);
  const [editedAsset, setEditedAsset] = useState<Asset | null>(null);

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

      setName(response.data.name);
      setDescription(response.data.description);
      setAssets(response.data.wallets_assets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    let totalValue = 0;

    for (const walletAsset of assets) {
      const assetValue = walletAsset.asset.price * walletAsset.quantity;
      totalValue += assetValue;
    }

    setTotalValue(totalValue);
  }, [assets]);

  const handleEditClick = (asset: Asset) => {
    setEditingRow(asset.id);
    setEditedAsset({ ...asset });
  };

  const handleConfirmEdit = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      if (!accessToken) {
        navigate('/');
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/wallets/${editedAsset?.wallet_id}/assets/${editedAsset?.asset_id}`,
        {
          quantity: editedAsset?.quantity,
          price_ceiling: editedAsset?.price_ceiling,
          bias: editedAsset?.bias,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.id === editedAsset?.id ? (editedAsset as Asset) : asset
        )
      );

      setEditingRow(0);
      setEditedAsset(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(0);
    setEditedAsset(null);
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
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset, index) => (
              <TableRow
                key={asset.id}
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
                    <TableCell>
                      {editingRow === asset.id ? (
                        <TextField
                          value={editedAsset?.quantity}
                          onChange={(e) =>
                            setEditedAsset({
                              ...(editedAsset as Asset),
                              quantity: parseFloat(e.target.value),
                            })
                          }
                          type="number"
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      ) : (
                        asset.quantity
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(asset.asset.price)}</TableCell>
                    <TableCell>
                      {editingRow === asset.id ? (
                        <TextField
                          value={editedAsset?.price_ceiling || ''}
                          onChange={(e) =>
                            setEditedAsset({
                              ...(editedAsset as Asset),
                              price_ceiling: parseFloat(e.target.value) || 0,
                            })
                          }
                          type="number"
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      ) : asset.price_ceiling ? (
                        formatCurrency(asset.price_ceiling)
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {asset.price_ceiling
                        ? formatPercentage((asset.asset.price / asset.price_ceiling) * 100)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {editingRow === asset.id ? (
                        <TextField
                          value={editedAsset?.bias}
                          onChange={(e) =>
                            setEditedAsset({
                              ...(editedAsset as Asset),
                              bias: e.target.value,
                            })
                          }
                        />
                      ) : (
                        asset.bias
                      )}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  {formatCurrency(
                    (editingRow === asset.id ? editedAsset?.quantity : asset.quantity)! *
                      asset.asset.price
                  )}
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    {formatPercentage(
                      (((editingRow === asset.id ? editedAsset?.quantity : asset.quantity)! *
                        asset.asset.price *
                        100) /
                        totalValue) || 0
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {editingRow === asset.id ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmEdit}
                        size="small"
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancelEdit}
                        size="small"
                        style={{ marginLeft: '8px' }}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <IconButton onClick={() => handleEditClick(asset)}>
                      <EditIcon style={{ color: '#ffffff' }} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
