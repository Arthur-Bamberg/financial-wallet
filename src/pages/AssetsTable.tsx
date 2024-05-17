import { useEffect, useState } from 'react';
import '../global.css';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Wallet } from '@/interfaces/wallet.interface';
import { Asset } from '@/types/asset.type';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types/order.type';

export function AssetsTable() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [walletName, setWalletName] = useState<string>('');
  const [walletDescription, setWalletDescription] = useState<string>('');
  const [totalValueWallet, setTotalValueWallet] = useState<number>(0);

  const listOrders = (
    valuePerAsset: number,
    numberOfAssets: number,
    bias: string,
  ) => {
    const assetsToBuy = assets
      .filter((asset) => asset.bias === bias)
      .sort((a, b) => a.percentageWallet - b.percentageWallet)
      .slice(0, numberOfAssets);

    const maxValue = valuePerAsset * 1.1;

    const orders: Order[] = [];

    let totalValue = 0;

    assetsToBuy.forEach((asset) => {
      const quantity =
        Math.ceil(valuePerAsset / asset.price) * asset.price > maxValue
          ? Math.floor(valuePerAsset / asset.price)
          : Math.ceil(valuePerAsset / asset.price);
      const totalPrice = quantity * asset.price;

      totalValue += totalPrice;

      orders.push({
        name: asset.name,
        type: asset.type,
        price: asset.price,
        quantity,
        totalPrice,
      });
    });

    console.log('Valor total: ' + totalValue);
    console.log(orders);
  };

  const fetchAssets = async () => {
    try {
      const result = await axios.get<Wallet>(
        'http://localhost:3000/wallets/a387cdd5-8d0b-4d0c-8e20-da51bd5b56e0',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
        },
      );

      setWalletName(result.data.name);
      setWalletDescription(result.data.description);

      const newAssets: Asset[] = [];

      let totalValueWallet = 0;

      result.data.wallets_assets.forEach((walletAsset) => {
        totalValueWallet +=
          walletAsset.quantity * (walletAsset.asset.price * 100); // To don't lose precision
      });

      totalValueWallet /= 100;

      setTotalValueWallet(totalValueWallet);

      result.data.wallets_assets.forEach((walletAsset) => {
        const totalValue = walletAsset.quantity * walletAsset.asset.price;
        const percentageCeiling = walletAsset.price_ceiling
          ? (walletAsset.asset.price / walletAsset.price_ceiling) * 100
          : null;

        newAssets.push({
          id: walletAsset.id,
          name: walletAsset.asset.short_name,
          rank: walletAsset.rank,
          type: walletAsset.asset.type.name,
          quantity: walletAsset.quantity,
          price: walletAsset.asset.price,
          priceCeiling: walletAsset.price_ceiling,
          percentageCeiling,
          bias: walletAsset.bias,
          totalValue,
          percentageWallet: (totalValue / totalValueWallet) * 100,
          totalValueWallet,
        });
      });

      setAssets(newAssets);
    } catch (error) {
      navigate('/');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      listOrders(200, 4, 'Comprar');
    }
  }, [assets]);

  return (
    <div className="w-4/5 h-4/5 mx-auto bg-gray-800 text-white rounded-lg">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold">{walletName}</h1>
        <p className="text-md mb-2">{walletDescription}</p>
        <p className="text-lg font-semibold">
          Valor Total: R$ {totalValueWallet}
        </p>
      </div>
      <Table>
        <TableCaption>{walletDescription}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead className="w-[120px]">Nome</TableHead>
            <TableHead className="w-[80px]">Tipo</TableHead>
            <TableHead className="w-[100px]">Quantidade</TableHead>
            <TableHead className="w-[80px]">Individual</TableHead>
            <TableHead className="w-[80px]">Preço teto</TableHead>
            <TableHead className="w-[50px]">% teto</TableHead>
            <TableHead className="w-[80px]">Viés</TableHead>
            <TableHead className="w-[80px]">Valor</TableHead>
            <TableHead className="w-[90px]">Porcentagem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>{asset.rank}</TableCell>
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.type}</TableCell>
              <TableCell>{asset.quantity}</TableCell>
              <TableCell>R$ {asset.price.toFixed(2)}</TableCell>
              <TableCell>
                {asset.priceCeiling
                  ? 'R$ ' + asset.priceCeiling.toFixed(2)
                  : ' - '}
              </TableCell>
              <TableCell>
                {asset.percentageCeiling
                  ? `${asset.percentageCeiling.toFixed(2)}%`
                  : ' - '}
              </TableCell>
              <TableCell>{asset.bias}</TableCell>
              <TableCell>R$ {asset.totalValue.toFixed(2)}</TableCell>
              <TableCell>{asset.percentageWallet.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
