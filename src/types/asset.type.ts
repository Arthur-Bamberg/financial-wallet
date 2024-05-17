export type Asset = {
  id: string;
  name: string;
  rank: number;
  type: string;
  quantity: number;
  price: number;
  priceCeiling: number | null;
  percentageCeiling: number | null;
  bias: string;
  totalValue: number;
  percentageWallet: number;
  totalValueWallet: number;
};
