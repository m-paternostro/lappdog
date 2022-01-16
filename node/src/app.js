import cookieParser from 'cookie-parser';
import cors from 'cors';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';

import createCalculatorRouter from './routes/calculator.js';
import createFibonacciRouter from './routes/fibonacci.js';
import createLedgerModel from './models/ledger.js';
import createLedgerRouter from './routes/ledger.js';
import createPranksterRouter from './routes/prankster.js';

const nodeVersion = process.version;
const implementation = Object.freeze({
  id: `node-${nodeVersion}`,
  name: `Node.js (${nodeVersion})`,
  image: 'https://nodejs.org/static/images/logo.svg',
  color: '173, 187, 122',
});

let disposing = false;
const app = express();

const calculatorRouter = createCalculatorRouter();
const fibonacciRouter = createFibonacciRouter();
const ledgerModel = createLedgerModel();
const ledgerRouter = createLedgerRouter(ledgerModel);
const pranksterRouter = createPranksterRouter();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, resp, next) => (disposing
  ? resp.send(503, { message: 'The application is shutting down.' })
  : next()));

app.get('/', (req, res) => res.send(implementation));

app.use('/calculator', calculatorRouter);
app.use('/fibonacci', fibonacciRouter);
app.use('/ledger', ledgerRouter);
app.use('/prankster', pranksterRouter);

app.use((req, res, next) => next(createError(404)));

// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, next) => {
  const description = {};
  description.message = err.message || 'An error has happened.';
  if (app.get('env') === 'development') {
    const stack = err.stack?.split('\n');
    if (stack && stack.length > 1) {
      description.stack = stack;
    }
  }

  res.status(err.status || 500);
  res.json(description);
});

export const disposeApp = async () => {
  disposing = true;
  await ledgerModel.dispose();
};

export default app;
