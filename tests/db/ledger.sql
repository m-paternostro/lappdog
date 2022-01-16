SELECT * from users;
SELECT * from transactions;

INSERT INTO users (name, balance) VALUES ("john", 10), ("mary", 20);

SELECT * from users;
SELECT * from transactions;

SELECT registerTransaction("john", "mary", 4);

SELECT * from users;
SELECT * from transactions;
