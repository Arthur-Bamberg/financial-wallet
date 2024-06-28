import { useEffect, useState } from 'react';
import '../global.css';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Wallet } from '@/interfaces/wallet.interface';
import { Asset } from '@/types/asset.type';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types/order.type';
import { MyTable } from '@/components/my/my-table';
import { TableAsset } from '@/types/table-asset.type';
import { Progress } from '@/components/shadcn-ui/progress';

export function AssetsTable() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tableAssets, setTableAssets] = useState<TableAsset[]>([]);
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
        id: asset.id,
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
      const interval = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 1);
      }, 80);


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
      const newTableAssets: TableAsset[] = [];

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
        const percentageWallet = (totalValue / totalValueWallet) * 100;

        newAssets.push({
          id: walletAsset.asset_id,
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

        newTableAssets.push({
          id: walletAsset.asset_id,
          name: walletAsset.asset.short_name,
          rank: walletAsset.rank.toString(),
          type: walletAsset.asset.type.name,
          quantity: walletAsset.quantity.toString(),
          price: `R$ ${walletAsset.asset.price.toFixed(2)}`,
          priceCeiling: walletAsset.price_ceiling
            ? 'R$ ' + walletAsset.price_ceiling.toFixed(2)
            : ' - ',
          percentageCeiling: percentageCeiling
            ? `${percentageCeiling.toFixed(2)}%`
            : ' - ',
          bias: walletAsset.bias,
          totalValue: `R$ ${totalValue.toFixed(2)}`,
          percentageWallet: `${percentageWallet.toFixed(2)}%`,
        });
      });

      setAssets(newAssets);
      setTableAssets(newTableAssets);

      clearInterval(interval);
      setProgress(100);
    } catch (error) {
      navigate('/');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      listOrders(200, 5, 'Comprar');
    }
  }, [assets]);

  return (
    <div className="w-4/5 h-4/5 mx-auto bg-gray-800 text-white rounded-lg">
      {
        progress < 100 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h3 className='p-4'>Progress: {progress}%</h3>
            <Progress value={progress} />
          </div>
        ) : (<><div className="mb-4 p-5 text-center">
          <h1 className="text-2xl font-bold">{walletName}</h1>
          <p className="text-md mb-2">{walletDescription}</p>
          <p className="text-lg font-semibold">
            Valor Total: R$ {totalValueWallet}
          </p>
        </div>
          <MyTable columns={[
            { name: 'ID', param: 'id', width: '300px' },
            { name: 'Rank', param: 'rank', width: '50px' },
            { name: 'Nome', param: 'name', width: '120px' },
            { name: 'Tipo', param: 'type', width: '50px' },
            { name: 'Quantidade', param: 'quantity', width: '50px' },
            { name: 'Individual', param: 'price', width: '80px' },
            { name: 'Preço teto', param: 'priceCeiling', width: '80px' },
            { name: '% teto', param: 'percentageCeiling', width: '50px' },
            { name: 'Viés', param: 'bias', width: '80px' },
            { name: 'Valor', param: 'totalValue', width: '120px' },
            { name: 'Porcentagem', param: 'percentageWallet', width: '90px' },
          ]} description={walletDescription} data={tableAssets} /></>)
      }
    </div>
  );
}
