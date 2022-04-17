import { isMobile } from 'react-device-detect'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Machine from './assets/blaster2.png';
import CardContent from '@material-ui/core/CardContent';
import styled from 'styled-components';
import { Divider, Box } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';

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

export default function Weapon3(){
  const classes = useStyles();

  return (
    <MintContainer>
    <Grid container style={{marginTop: 100}} spacing={3}>
         <Grid item md={3} xs={12}></Grid>
         <Grid item md={6} xs={12}>
              <Card className={classes.root}>
                   <CardContent>
                        <Header className={classes.title} variant="h5" gutterBottom>
                             Bounty Hunter Space Guild Black Market (Week 3)
                        </Header>
                   </CardContent>
                   <CardContent className={classes.cardSection}>
                        <Grid container spacing={2}>
                             <Grid item md={5} xs={12}>
                                  <img src={Machine} alt="raffle" width="100%" className={classes.img} />
                             </Grid>
                             <Grid item md={7} xs={12}>
                                  <Box className={classes.box}>
                                       <Box my={1}>
                                            <Title>The Jigsaw</Title>
                                       </Box>
                                       <Grid container justifyContent="center">
                                            <Grid item xs={5}>
                                                    <Grid item xs={12}>
                                                      <Head variant="body2" color="textSecondary">
                                                        Price per Item
                                                      </Head>
                                                      <Typography
                                                        variant="h6"
                                                        color="textPrimary"
                                                        style={{ fontFamily: 'Saira', fontWeight: 'bold' }}
                                                      >
                                                        7500 $BNTY
                                                      </Typography>
                                                    </Grid>
                                            </Grid>
                                            {isMobile ? (
                                              <></>
                                            ):(
                                            <Grid item xs={1}>
                                              <Divider orientation="vertical" />
                                            </Grid>)
                                            }
                                            <Grid item xs={6}>
                                                 <Head color="textSecondary" variant="body2">Sale Ended On</Head>
                                                 <Grid item lg={7}>
                                                      <>
                                                        <Typography
                                                          variant="h6"
                                                          align="center"
                                                          display="block"
                                                          style={{ fontFamily: 'Saira', fontWeight: 'bold' }}
                                                        >
                                                          04/17/2022
                                                        </Typography>
                                                      </>
                                                </Grid>                                                 
                                            </Grid>
                                       </Grid>
                                       <Box mt={5}>
                                       <Grid container justifyContent="center">
                                            <Grid item xs={5}>
                                                    <Grid item xs={12}>
                                                      <Head variant="body2" color="textSecondary">
                                                        Items Sold
                                                      </Head>
                                                      <Typography
                                                        variant="h6"
                                                        color="textPrimary"
                                                        style={{ fontFamily: 'Saira', fontWeight: 'bold' }}
                                                      >
                                                        377
                                                      </Typography>
                                                    </Grid>
                                            </Grid>
                                            {isMobile ? (
                                              <></>
                                            ):(
                                            <Grid item xs={1}>
                                              <Divider orientation="vertical" />
                                            </Grid>)
                                            }
                                                 <Grid item md={6} xs={10}>
                                                      <>
                                                        <ConnectButton disabled={true}>SOLD OUT</ConnectButton>
                                                      </>
                                                </Grid>                                                 
                                       </Grid>
                                      </Box>
                                  </Box>
                             </Grid>
                        </Grid>
                   </CardContent>
              </Card>
         </Grid>

    </Grid>
    </MintContainer>
  );
};
