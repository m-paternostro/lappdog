CREATE SCHEMA ledger;

USE ledger;

CREATE TABLE users (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  balance DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (name),
  CONSTRAINT name_length CHECK (CHAR_LENGTH(name) >= 3),
  CONSTRAINT balance_minimum CHECK (balance >= 0)
) ENGINE = InnoDB;

CREATE TABLE transactions (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fromuser SMALLINT UNSIGNED NOT NULL,
  touser SMALLINT UNSIGNED NOT NULL,
  amount DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_fromuser FOREIGN KEY (fromuser) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_touser FOREIGN KEY (touser) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT amount_minimum CHECK (amount >= 0)
) ENGINE = InnoDB;

DELIMITER //
CREATE TRIGGER update_balances
  AFTER INSERT ON transactions
  FOR EACH ROW
    BEGIN
      UPDATE users SET users.balance = (users.balance - NEW.amount) WHERE users.id = NEW.fromuser;
      UPDATE users SET users.balance = (users.balance + NEW.amount) WHERE users.id = NEW.touser;
    END;
//
DELIMITER ;

DELIMITER //
SET GLOBAL log_bin_trust_function_creators = 1;
CREATE FUNCTION registerTransaction (fromname VARCHAR(50), toname VARCHAR(50), amount DECIMAL(5,2))
RETURNS BOOLEAN MODIFIES SQL DATA
  BEGIN
    DECLARE fromid SMALLINT UNSIGNED;
    DECLARE toid SMALLINT UNSIGNED;

    SELECT id INTO fromid FROM users WHERE name = fromname;
    SELECT id INTO toid FROM users WHERE name = toname;

    INSERT INTO transactions (fromuser, touser, amount) VALUES (fromid, toid, amount);
    return 1;
  END;
//
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ledger.explain_statement(IN query TEXT)
    SQL SECURITY DEFINER
BEGIN
    SET @explain := CONCAT('EXPLAIN FORMAT=json ', query);
    PREPARE stmt FROM @explain;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END $$
DELIMITER ;
