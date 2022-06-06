import { useEffect, useMemo, useState, useCallback} from 'react';
import { isMobile } from 'react-device-detect'
import * as anchor from '@project-serum/anchor';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Machine from './assets/spaceship.png';
import CardContent from '@material-ui/core/CardContent';
import styled from 'styled-components';
import { Snackbar, Divider, Box } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from './candy-machine';
import { AlertState, toDate, formatNumber, getAtaForMint } from './utils';
import { MintCountdown } from './MintCountdown';
import { MintButton } from './MintButton';
import { GatewayProvider } from '@civic/solana-gateway-react';

const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 40px;
  color: white;
  text-transform: capitalize;
  font-family: 'Saira';
  font-size: 16px;
  margin-left: -5%;
  margin-top: 5%;
  font-weight: bold;
  background: #F86000;
  &:hover {
    background: transparent;
  }  
`;

const Title = styled(Typography)`
  font-family: 'Saira Extra Condensed', sans-serif;
  font-weight: bold;
  font-size: 42px;
`
const Header = styled(Typography)`
  font-family: 'Saira Extra Condensed', sans-serif;
  font-weight: bold;
  font-size: 18px;
`

const Head = styled(Typography)`
  font-family: 'Saira';
  font-size: 18px;
`

const useStyles = makeStyles((theme: Theme) =>
     createStyles({
          root: {
               borderRadius: "10px",
               background: "#151A1F",
               fontFamily:"Saira",
          },
          box: {
               [theme.breakpoints.down('sm')]: {
                    textAlign: "center",
               },
          },
          img: {
               borderRadius: "10px",
          },
          bullet: {
               display: 'inline-block',
               transform: 'scale(0.8)',
          },
          cardSection: {
               borderRadius: "10px 10px 0px 0px",
               background: "#424242"
          },
          title: {
               fontSize: 14,
               fontWeight: 600,
          },
     })
);

const MintContainer = styled.div`
  z-index: 5;
`; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });
  const [isActive, setIsActive] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [itemsRemaining, setItemsRemaining] = useState<number>();
  const [isWhitelistUser, setIsWhitelistUser] = useState(false);
  const [isPresale, setIsPresale] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>();
  const classes = useStyles();
  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection,
        );
        let active =
          cndy?.state.goLiveDate?.toNumber() < new Date().getTime() / 1000;
        let presale = false;
        // whitelist mint?
        if (cndy?.state.whitelistMintSettings) {
          // is it a presale mint?
          if (
            cndy.state.whitelistMintSettings.presale &&
            (!cndy.state.goLiveDate ||
              cndy.state.goLiveDate.toNumber() > new Date().getTime() / 1000)
          ) {
            presale = true;
          }
          // is there a discount?
          if (cndy.state.whitelistMintSettings.discountPrice) {
            setDiscountPrice(cndy.state.whitelistMintSettings.discountPrice);
          } else {
            setDiscountPrice(undefined);
            // when presale=false and discountPrice=null, mint is restricted
            // to whitelist users only
            if (!cndy.state.whitelistMintSettings.presale) {
              cndy.state.isWhitelistOnly = true;
            }
          }
          // retrieves the whitelist token
          const mint = new anchor.web3.PublicKey(
            cndy.state.whitelistMintSettings.mint,
          );
          const token = (await getAtaForMint(mint, anchorWallet.publicKey))[0];

          try {
            const balance = await props.connection.getTokenAccountBalance(
              token,
            );
            let valid = parseInt(balance.value.amount) > 0;
            // only whitelist the user if the balance > 0
            setIsWhitelistUser(valid);
            active = (presale && valid) || active;
          } catch (e) {
            setIsWhitelistUser(false);
            // no whitelist user, no mint
            if (cndy.state.isWhitelistOnly) {
              active = false;
            }
            console.log('There was a problem fetching whitelist token balance');
            console.log(e);
          }
        }
        // datetime to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number));
          if (
            cndy.state.endSettings.number.toNumber() <
            new Date().getTime() / 1000
          ) {
            active = false;
          }
        }
        // amount to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable,
          );
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        if (cndy.state.isSoldOut) {
          active = false;
        }

        setIsActive((cndy.state.isActive = active));
        setIsPresale((cndy.state.isPresale = presale));
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async () => {
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true,
          );
        }

        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
          candyMachine.state.isSoldOut = remaining === 0;
          setAlertState({
            open: true,
            message: 'Congratulations! Weapon Purchased!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Weapon Purchase Failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Weapon Purchase Failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
      // updates the candy machine state to reflect the lastest
      // information on chain
      refreshCandyMachineState();
    } finally {
      setIsUserMinting(false);
    }
  };

  const toggleMintButton = () => {
    let active = !isActive || isPresale;

    if (active) {
      if (candyMachine!.state.isWhitelistOnly && !isWhitelistUser) {
        active = false;
      }
      if (endDate && Date.now() >= endDate.getTime()) {
        active = false;
      }
    }

    if (
      isPresale &&
      candyMachine!.state.goLiveDate &&
      candyMachine!.state.goLiveDate.toNumber() <= new Date().getTime() / 1000
    ) {
      setIsPresale((candyMachine!.state.isPresale = false));
    }

    setIsActive((candyMachine!.state.isActive = active));
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  return (
    <MintContainer>
    <Grid container style={{marginTop: 100}} spacing={3}>
         <Grid item md={3} xs={12}></Grid>
         <Grid item md={6} xs={12}>
              <Card className={classes.root}>
                   <CardContent>
                        <Header className={classes.title} variant="h5" gutterBottom>
                          Bounty Hunter Space Guild Black Market (Week 8)
                        </Header>
                   </CardContent>
                   <CardContent className={classes.cardSection}>
                        <Grid container spacing={2}>
                            <>
                             <Grid item md={5} xs={12}>
                                  <img src={Machine} alt="raffle" width="100%" className={classes.img} />
                             </Grid>
                            </>
                             <Grid item md={7} xs={12}>
                                  <Box className={classes.box}>
                                       <Box my={1}>
                                            <Title>Ancient Velurian Sabre</Title>
                                       </Box>
                                       <Grid container justifyContent="center">
                                            <Grid item xs={5}>  
                                                 { candyMachine && (
                                                    <Grid item xs={12}>
                                                      <Head variant="body2" color="textSecondary">
                                                        {isWhitelistUser && discountPrice
                                                          ? 'Discount Price'
                                                          : 'Price Per Item'}
                                                      </Head>
                                                      <Typography
                                                        variant="h6"
                                                        color="textPrimary"
                                                        style={{ fontFamily: 'Saira', fontWeight: 'bold' }}
                                                      >
                                                        {isWhitelistUser && discountPrice
                                                          ? ` ${formatNumber.asNumber(discountPrice)} $BNTY/Item`
                                                          : ` ${formatNumber.asNumber(
                                                              candyMachine.state.price,
                                                            )} $BNTY`}
                                                      </Typography>
                                                    </Grid>
                                                    )}
                                            </Grid>
                                            {isMobile ? (
                                              <></>
                                            ):(
                                            <Grid item xs={1}>
                                              <Divider orientation="vertical" />
                                            </Grid>)
                                            }
                                            {candyMachine && (
                                            <Grid item xs={6}>
                                                    {isActive && endDate && Date.now() < endDate.getTime() ? (
                                                      <>
                                                        <Head color="textSecondary" variant="body2">Sale Ends In</Head>
                                                        <Grid item lg={7}></Grid>
                                                        <MintCountdown
                                                          key="endSettings"
                                                          date={getCountdownDate(candyMachine)}
                                                          style={{ justifyContent: 'flex-end', fontFamily:'Saira', fontWeight: 'bold', marginRight: "38%"}}
                                                          status="COMPLETED"
                                                          onComplete={toggleMintButton}
                                                        />
                                                        <Typography
                                                          variant="caption"
                                                          align="center"
                                                          display="block"
                                                          style={{ fontWeight: 'bold' }}
                                                        >
                                                        </Typography>
                                                      </>
                                                      ) : (
                                                        <>
                                                        <Head color="textSecondary" variant="body2">Sale Starts In</Head>
                                                        <Grid item lg={7}></Grid>
                                                        <MintCountdown
                                                          key="goLive"
                                                          date={getCountdownDate(candyMachine)}
                                                          style={{ justifyContent: 'flex-end', fontFamily:'Saira', fontWeight: 'bold', marginRight: "38%" }}
                                                          status={
                                                            candyMachine?.state?.isSoldOut ||
                                                            (endDate && Date.now() > endDate.getTime())
                                                              ? 'COMPLETED'
                                                              : isPresale
                                                              ? 'PRESALE'
                                                              : 'LIVE'
                                                          }
                                                          onComplete={toggleMintButton}
                                                        />
                                                        {isPresale &&
                                                          candyMachine.state.goLiveDate &&
                                                          candyMachine.state.goLiveDate.toNumber() >
                                                            new Date().getTime() / 1000
                                                          }
                                                        </>
                                                      )}
                                                </Grid>                                                 
                                            )}
                                       </Grid>
                                       <Box mt={5}>
                                            <Grid container spacing={3} justifyContent="center">
                                                 <Grid item md={6} xs={12}>
                                                 {!wallet.connected ? (
                                                        <></>
                                                      ) : (
                                                        <>
                                                          {candyMachine && (
                                                            <Grid
                                                              container
                                                              direction="row"
                                                              justifyContent="center"
                                                              wrap="nowrap"
                                                            >
                                                              <Grid item xs={12}>
                                                                <Head variant="body2" color="textSecondary">
                                                                  Remaining Items
                                                                </Head>
                                                                <Typography
                                                                  variant="h6"
                                                                  color="textPrimary"
                                                                  style={{
                                                                    fontFamily:'Saira',
                                                                    fontWeight: 'bold',
                                                                    
                                                                  }}
                                                                >
                                                                  {`${itemsRemaining}`}
                                                                </Typography>
                                                              </Grid>
                                                            </Grid>
                                                          )}
                                                        </>
                                                      )}
                                                 </Grid>
                                                 <Grid item md={6} xs={10}>
                                                      {!wallet.connected ? (
                                                        <ConnectButton>Connect Wallet</ConnectButton>
                                                      ) : (
                                                        <>
                                                          {candyMachine && (
                                                            <Grid
                                                              container
                                                              direction="row"
                                                              justifyContent="center"
                                                              wrap="nowrap"
                                                            >
                                                            </Grid>
                                                          )}
                                                          <MintContainer>
                                                            {candyMachine?.state.isActive &&
                                                            candyMachine?.state.gatekeeper &&
                                                            wallet.publicKey &&
                                                            wallet.signTransaction ? (
                                                              <GatewayProvider
                                                                wallet={{
                                                                  publicKey:
                                                                    wallet.publicKey ||
                                                                    new PublicKey(CANDY_MACHINE_PROGRAM),
                                                                  //@ts-ignore
                                                                  signTransaction: wallet.signTransaction,
                                                                }}
                                                                gatekeeperNetwork={
                                                                  candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                                                                }
                                                                clusterUrl={rpcUrl}
                                                                options={{ autoShowModal: false }}
                                                              >
                                                                <MintButton
                                                                  candyMachine={candyMachine}
                                                                  isMinting={isUserMinting}
                                                                  onMint={onMint}
                                                                  isActive={isActive || (isPresale && isWhitelistUser)}
                                                                />
                                                              </GatewayProvider>
                                                            ) : (
                                                              <MintButton
                                                                candyMachine={candyMachine}
                                                                isMinting={isUserMinting}
                                                                onMint={onMint}
                                                                isActive={isActive || (isPresale && isWhitelistUser)}
                                                              />
                                                            )}
                                                          </MintContainer>
                                                        </>
                                                      )}
                                                 </Grid>
                                            </Grid>
                                       </Box>
                                  </Box>
                             </Grid>
                        </Grid>
                   </CardContent>
              </Card>
         </Grid>
         <Grid item md={3} xs={12}></Grid>
    </Grid>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </MintContainer>
  );
};

const getCountdownDate = (
  candyMachine: CandyMachineAccount,
): Date | undefined => {
  if (
    candyMachine.state.isActive &&
    candyMachine.state.endSettings?.endSettingType.date
  ) {
    return toDate(candyMachine.state.endSettings.number);
  }

  return toDate(
    candyMachine.state.goLiveDate
      ? candyMachine.state.goLiveDate
      : candyMachine.state.isPresale
      ? new anchor.BN(new Date().getTime() / 1000)
      : undefined,
  );
};

export default Home;
