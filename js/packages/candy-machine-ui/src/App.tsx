import './App.css';
import { useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import Home from './Home';
import Appbar from './layouts/Appbar';
import Weapon1 from './Weapon1';
import Weapon2 from './Weapon2';
import Weapon3 from './Weapon3';
import Weapon4 from './Weapon4';
import Weapon5 from './Weapon5';
import Weapon6 from './Weapon6';
import Weapon7 from './Weapon7';
import Weapon8 from './Weapon8';
import Weapon9 from './Weapon9';
import Weapon10 from './Weapon10';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';

import { ThemeProvider, createTheme } from '@material-ui/core';
import Particle from "./Particles";

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID!,
    );

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

const candyMachineId = getCandyMachineId();
const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl('devnet'),
);

const txTimeoutInMilliseconds = 30000;

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [],
  );

  return (
    <>
    <Particle/>
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletDialogProvider>
          <Appbar/>
            <Home
              candyMachineId={candyMachineId}
              connection={connection}
              txTimeout={txTimeoutInMilliseconds}
              rpcHost={rpcHost}
            />
            <Weapon10/>
            <Weapon9/>
            <Weapon8/>
            <Weapon7/>
            <Weapon6/>
            <Weapon5/>
            <Weapon4/>
            <Weapon3/>
            <Weapon2/>
            <Weapon1/>
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
    </>
  );
};

export default App;
