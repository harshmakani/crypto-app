import EventEmitter from 'events'

function coinbaseMessageHandler(message) {
    const coinbaseData = JSON.parse(message.data)
    switch (coinbaseData['type']) {
        case 'subscriptions':
            break
        case 'error':
            break
        case 'snapshot':
            this.emit('snapshot', coinbaseData)
            break
        case 'l2update':
            this.emit('l2update', coinbaseData)
            break
        default:
            break
    }
}

export default class WebSocketConnectionUtil extends EventEmitter {
    constructor() {
        super()
        const webSocket = new WebSocket('wss://ws-feed.pro.coinbase.com');
        webSocket.addEventListener('open', () => {
            const subscription = JSON.stringify({
                "type": "subscribe",
                "product_ids": [
                    "BTC-USD"
                ],
                "channels": [
                    "level2"
                ]
            });
            console.log(`got open`)
            webSocket.send(subscription);            
        })
        webSocket.addEventListener('error', (error) => {
            console.log('WebSocket Error ' + error);
        });
        webSocket.addEventListener('close', () => {
            console.log(`got close`)

        });
        webSocket.addEventListener('message', coinbaseMessageHandler.bind(this))

        setTimeout(function () { webSocket.close() }, 10000);
    }
}