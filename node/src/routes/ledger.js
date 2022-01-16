import { Router } from 'express';

import { handleError } from '../common/util.js';

export const get = (producer) => handleError(async (req, res) => res.send(await producer(req)));

export const post = (bodyConsumer) => handleError(async (req, res) => {
  const body = req.body;
  if (typeof body !== 'object') {
    throw new Error('The request body must be an object.');
  }
  await bodyConsumer(body);
  res.sendStatus(201);
});

export default (model) => {
  const router = Router();

  router.get('/', get(() => model.summarize()));

  router.get('/users', get(() => model.listUsers()));
  router.post('/users', post((body) => model.registerUser(body)));

  router.get('/transactions', get(() => model.listTransactions()));
  router.post('/transactions', post((body) => model.recordTransaction(body)));

  return router;
};
