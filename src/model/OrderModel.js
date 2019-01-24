/*
 * structure to hold incoming websocket message (buy/sell || bid/ask)
 */
export default class OrderModel {
    constructor({ priceString, sizeString }) {
        this.priceString = priceString
        this.sizeString = sizeString
        this.price = parseFloat(priceString)
        this.size = parseFloat(sizeString)
    }
}