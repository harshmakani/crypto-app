import React, { Component } from 'react';
import './App.css';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import WebSocketConnectionUtil from './utils/WebSocketConnectionUtil';
import OrderModel from './model/OrderModel';


const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 3
  },
  buy: {
    color: '#44be24',
  },
  sell: {
    color: 'red'
  }
});

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      orderBookSubscriber: new WebSocketConnectionUtil(),
      buy: [],
      sell: []
    }

    this.state.orderBookSubscriber.on('snapshot', (snapshot) => {
      // Displaying only first 50 items from buy and sell
      const sell = snapshot['asks'].slice(0, 50);

      const buy = snapshot['bids'].slice(0, 50);

      this.provideSnapshot(buy, sell);
    })

    this.state.orderBookSubscriber.on('l2update', (l2update) => {
      this.provideL2Update(l2update);
    })
  }

  /*
   * creates snapshot of buy and sell first
   */
  provideSnapshot(buy, sell) {
    let buyArr = [];
    let sellArr = [];

    buy.forEach((value) => {
      const [priceString, sizeString] = value;
      this.insertSorted({ orderArray: buyArr, orderToInsert: new OrderModel({ priceString, sizeString }) });
    });

    sell.forEach((value) => {
      const [priceString, sizeString] = value;
      this.insertSorted({ orderArray: sellArr, orderToInsert: new OrderModel({ priceString, sizeString }) });
    });

    this.setState({ buy: buyArr, sell: sellArr });
  }

  /*
   * updates buy and sell values as per l2update messages
   */
  provideL2Update(l2update) {
    let buyArr = this.state.buy;
    let sellArr = this.state.sell;
    l2update['changes'].forEach((changeTuple) => {
      const [side, priceString, sizeString] = changeTuple
      switch (side) {
        case 'buy':
          if (sizeString === '0') {
            this.deleteOrderOfPrice({ orders: buyArr, priceString })
          } else {
            this.insertSorted({ orderArray: buyArr, orderToInsert: new OrderModel({ priceString, sizeString }) });
          }
          const buy = buyArr.slice(0, 50);
          this.setState({ buy: buy });
          break
        case 'sell':
          if (sizeString === '0') {
            this.deleteOrderOfPrice({ orders: sellArr, priceString });
          } else {
            this.insertSorted({ orderArray: sellArr, orderToInsert: new OrderModel({ priceString, sizeString }) });
          }
          const sell = sellArr.slice(0, 50);
          this.setState({ sell: sell });
          break
        default:
          console.log('error');
          break // log error
      }
    })
  }

  /*
   * insert buy/sell values in sorted manner
   */
  insertSorted({ orderArray, orderToInsert }) {
    for (let [index, order] of orderArray.entries()) {
      if (!order) { continue; }
      if (orderToInsert.price > order.price) {
        orderArray.splice(index, 0, orderToInsert);
        return;
      }
    }
    orderArray.push(orderToInsert);
  }

  /*
   * delete buy/sell row if size is 0
   */
  deleteOrderOfPrice({ orders, priceString }) {
    const index = orders.findIndex((order) => order && order.priceString === priceString)
    if (index === -1) { return }
    orders.splice(index, 1)
  }

  /*
   * renders buy/sell rows
   */
  renderBuySell(value, classToDisplay) {
    let returnArr = [];
    value.map((row, index) => {
      return returnArr.push(
        <TableRow key={index}>
          <TableCell component="th" scope="row" className={classToDisplay}>
            {row.priceString}
          </TableCell>
          <TableCell align="right">{row.sizeString}</TableCell>
        </TableRow>
      );
    })
    return returnArr;
  }

  render() {
    const { classes } = this.props;
    const { sell, buy } = this.state;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs>
            <Paper>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.head}>Buy (Price)</TableCell>
                    <TableCell align="right">Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.renderBuySell(buy, classes.buy)}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Sell (Price)</TableCell>
                    <TableCell align="right">Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.renderBuySell(sell, classes.sell)}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(App);
