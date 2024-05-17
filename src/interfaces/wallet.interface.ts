export interface Wallet {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  wallets_assets: WalletAsset[];
}

interface WalletAsset {
  id: string;
  asset_id: string;
  wallet_id: string;
  price_ceiling: number | null;
  rank: number;
  bias: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  asset: AssetDetail;
}

interface AssetDetail {
  id: string;
  short_name: string;
  full_name: string;
  price: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  type: AssetType;
}

interface AssetType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}
