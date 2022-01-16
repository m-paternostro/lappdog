import connect from './database.js';

const database = connect('ledger');

const dispose = async () => database.end();

const summarize = async () => {
  const results = await database.query(
    'select count(*) as users, sum(balance) as balance from users',
    'select count(*) as transactions from transactions',
  );

  return {
    users: results[0][0]?.users ?? 0,
    balance: results[0][0]?.balance ?? 0,
    transactions: results[1][0]?.transactions ?? 0,
  };
};

const listUsers = async () => database.query(
  'select name, balance from users',
);

const registerUser = async ({ name, balance }) => database.execute(
  'insert into users (name, balance) values (?, ?)',
  [name, balance],
);

const listTransactions = () => database.query(
  `
  select u1.name as 'from', u2.name as 'to', t.amount
  from transactions t, users u1, users u2
  where u1.id = t.fromuser and u2.id = t.touser
  `,
);

const recordTransaction = ({ from, to, amount }) => database.execute(
  'select registerTransaction(?, ?, ?)',
  [from, to, amount],
);

export default () => ({
  dispose,
  summarize,
  listUsers,
  registerUser,
  listTransactions,
  recordTransaction,
});
