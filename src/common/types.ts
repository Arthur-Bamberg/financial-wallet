export type Asset = {
  id: number;
  asset_id: number;
  wallet_id: number;
  price_ceiling: number;
  rank: number;
  bias: "Comprar" | "Vender" | "Manter" | string;
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

export type BaseAsset = {
  id: number;
  short_name: string;
  full_name: string;
  price: number;
  type_id: number;
  created_at: Date;
  updated_at: Date;
};
