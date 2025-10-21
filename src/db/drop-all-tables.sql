SET FOREIGN_KEY_CHECKS = 0;
SET GROUP_CONCAT_MAX_LEN = 32768;

SELECT CONCAT('DROP TABLE IF EXISTS ', GROUP_CONCAT(CONCAT('`', table_name, '`')) , ';')
INTO @drop_all
FROM information_schema.tables
WHERE table_schema = 'cobis';

PREPARE stmt FROM @drop_all;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;