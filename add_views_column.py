import sqlite3

connection = sqlite3.connect("blog.db")
cursor = connection.cursor()

cursor.execute("""
ALTER TABLE posts
ADD COLUMN views INTEGER NOT NULL DEFAULT 0
""")

connection.commit()
connection.close()

print("Views column added successfully.")