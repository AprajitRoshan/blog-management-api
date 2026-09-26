import sqlite3


connection = sqlite3.connect("blog.db")
cursor = connection.cursor()

cursor.execute("PRAGMA foreign_keys = OFF")

cursor.execute("""
ALTER TABLE users RENAME TO users_old
""")

cursor.execute("""
CREATE TABLE users (
    id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    password VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
    auth0_sub VARCHAR(255),
    subscription_plan_id INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY(subscription_plan_id)
        REFERENCES subscription_plans (id)
)
""")

cursor.execute("""
INSERT INTO users (
    id,
    username,
    email,
    password,
    auth_provider,
    auth0_sub,
    subscription_plan_id
)
SELECT
    id,
    username,
    email,
    password,
    auth_provider,
    auth0_sub,
    subscription_plan_id
FROM users_old
""")

cursor.execute("""
DROP TABLE users_old
""")

cursor.execute("""
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username
ON users(username)
""")

cursor.execute("""
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email
ON users(email)
""")

cursor.execute("""
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_auth0_sub
ON users(auth0_sub)
""")

cursor.execute("""
CREATE INDEX IF NOT EXISTS ix_users_id
ON users(id)
""")

connection.commit()

cursor.execute("PRAGMA foreign_keys = ON")

connection.close()

print("Users table updated successfully. Email can now be NULL.")