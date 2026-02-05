SET FOREIGN_KEY_CHECKS = 0;

SET @tables = (
  SELECT GROUP_CONCAT(CONCAT('`', table_name, '`'))
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
);

SET @sql = CONCAT('DROP TABLE IF EXISTS ', @tables);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;