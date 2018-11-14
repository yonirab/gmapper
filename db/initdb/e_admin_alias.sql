PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE admin_alias (
      _id INTEGER NOT NULL,                         -- REFERENCES  genes 
      admin_symbol VARCHAR(80) NOT NULL,            -- Unofficial gene alias symbol added by admin user
      FOREIGN KEY (_id) REFERENCES  genes  (_id)
    );