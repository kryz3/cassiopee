brew install postgresql
brew services start postgresql

psql -U postgres

CREATE DATABASE mydb;
CREATE USER admin WITH ENCRYPTED PASSWORD 'amin';
GRANT ALL PRIVILEGES ON DATABASE mydb TO admin;
