import { createContext, useState } from 'react';

export const WalletContext = createContext({ wallet: 0, setWallet: (value) => {} });

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState(0);

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            {children}
        </WalletContext.Provider>
    );
};
