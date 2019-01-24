import { OrderBook } from 'react-trading-ui';
import { connect } from 'react-redux';

const MyApp = ({ book }) => (
    <div className='my-app'>
        <OrderBook asks={book.asks} bids={book.bids} />
    </div>
)

export default connect(
    state => ({
        book: state.book
    })
)(MyApp);