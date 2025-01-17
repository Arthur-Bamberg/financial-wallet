import { createContext, useState, ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const WalletContext = createContext({ wallet: 0, setWallet: (_value: number) => {} });

export const WalletProvider = ({ children }: {children: ReactNode}) => {
    const [wallet, setWallet] = useState(0);

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            {children}
        </WalletContext.Provider>
    );
};
