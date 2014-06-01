START TRANSACTION;
SAVEPOINT restore;
INSERT INTO bands (name, active_from, active_to) VALUES ('blaah', 1939, 1999);
COMMIT;
SELECT * FROM bands;
ROLLBACK TO restore;
