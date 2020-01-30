CREATE USER 'dataworker'@'%' IDENTIFIED BY 'dataworker';
ALTER USER 'dataworker'@'%' IDENTIFIED WITH mysql_native_password BY 'dataworker';
CREATE DATABASE season_data;
GRANT ALL PRIVILEGES ON season_data.* TO 'dataworker'@'%';
