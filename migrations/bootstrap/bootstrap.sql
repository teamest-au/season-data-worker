CREATE USER 'dataworker'@'%' IDENTIFIED BY 'dataworker';
ALTER USER 'dataworker'@'%' IDENTIFIED WITH mysql_native_password BY 'dataworker';
CREATE DATABASE season_data CHARACTER SET utf8 COLLATE utf8_unicode_ci;
GRANT ALL PRIVILEGES ON season_data.* TO 'dataworker'@'%';
