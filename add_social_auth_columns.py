import sqlite3

connection = sqlite3.connect("blog.db")
cursor = connection.cursor()

cursor.execute("""
ALTER TABLE users
ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'local'
""")

cursor.execute("""
ALTER TABLE users
ADD COLUMN auth0_sub VARCHAR(255)
""")

cursor.execute("""
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_auth0_sub
ON users(auth0_sub)
""")

connection.commit()
connection.close()

print("Social authentication columns added successfully.")