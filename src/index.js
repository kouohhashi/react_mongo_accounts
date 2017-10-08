import React from 'react';
import ReactDOM from 'react-dom';

// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

// react-router-dom
import { BrowserRouter } from 'react-router-dom'

// redux
import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers'
import { Provider } from 'react-redux'

// css
import 'semantic-ui-css/semantic.min.css';

const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(logger)
  )
)

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
