import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Logo from '../assets/logo.svg';
import { Button } from '@material-ui/core';
const useStyles = makeStyles((theme: Theme) =>
     createStyles({
          grow: {
               flexGrow: 1,
          },
          main: {
               background: "transparent",
          },
          menuButton: {
               marginRight: theme.spacing(2),
          },
          title: {
               display: 'none',
               [theme.breakpoints.up('sm')]: {
                    display: 'block',
                    marginLeft: theme.spacing(2),
                    marginRight: theme.spacing(2),
                    textTransform: "capitalize",
                    fontFamily: "Saira",
               },
          },
          desktopButton: {
               minWidth: "150px",
               marginLeft: theme.spacing(2),
               marginRight: theme.spacing(2),
               textTransform: "capitalize",
          },
          sectionDesktop: {
               display: 'none',
               [theme.breakpoints.up('md')]: {
                    display: 'flex',
               },
          },
          sectionMobile: {
               display: 'flex',
               [theme.breakpoints.up('md')]: {
                    display: 'none',
               },
          },
     }),
);

export default function PrimarySearchAppBar() {
     const classes = useStyles();
     return (
          <div className={classes.grow}>
               <AppBar position="static" className={classes.main}>
                    <Toolbar>
                         <img src={Logo} alt="logo" height={40} width={40} />
                         <Button 
                              type="button"
                              onClick={(e) => {
                              e.preventDefault();
                              window.location.href='http://google.com';}}
                              className={classes.title} variant="text">                         
                              Explore
                         </Button>
                         <Button 
                              type="button"
                              onClick={(e) => {
                              e.preventDefault();
                              window.location.href='http://google.com';}}
                              className={classes.title} variant="text">                         
                              Artwork
                         </Button>
                         <Button 
                              type="button"
                              onClick={(e) => {
                              e.preventDefault();
                              window.location.href='http://google.com';}}
                              className={classes.title} variant="text">                         
                              Creator
                         </Button>
                         <Button         
                              type="button"
                              onClick={(e) => {
                              e.preventDefault();
                              window.location.href='http://google.com';}}
                              className={classes.title} variant="text">
                              Purchase BNTY
                         </Button>
                    </Toolbar>
               </AppBar>
          </div>
     );
}
