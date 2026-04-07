-- Auto-run on first PostgreSQL container start
-- Grants schema creation rights to vitto_user (required for Sequelize sync on PG 15+)
GRANT ALL ON SCHEMA public TO vitto_user;
ALTER DATABASE vitto_db OWNER TO vitto_user;
