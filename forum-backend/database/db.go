package database

import (
	"database/sql"
	"fmt"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // postgres driver import
	"log"
	"os"
)

// NTS: Global DB variable so handlers can access it
var DB *sql.DB

func InitDB() {
	var err error
	// Trying to load .en file
	_ = godotenv.Load()

	// This is for checking if there is a cloud database url first
	connStr := os.Getenv("DATABASE_URL")

	if connStr == "" {
		log.Fatal("CRITICAL ERROR: DATABASE_URL environment variable is not set!")
	}
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Connected to Database successfully!")

	createTables()
}

func createTables() {
	query := `
		CREATE TABLE IF NOT EXISTS topics (
    		id SERIAL PRIMARY KEY,
    		name TEXT NOT NULL UNIQUE
		);

		CREATE TABLE IF NOT EXISTS users (
    		username VARCHAR(50) PRIMARY KEY
		);

		CREATE TABLE IF NOT EXISTS posts (
    		id SERIAL PRIMARY KEY,
    		title TEXT NOT NULL,
    		description TEXT NOT NULL,
    		username TEXT DEFAULT 'Anonymous',
    		topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS comments (
    		id SERIAL PRIMARY KEY,
    		content TEXT NOT NULL,
    		username TEXT DEFAULT 'Anonymous',
    		post_id INTEGER REFERENCES posts(id),
    		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		INSERT INTO topics (name) VALUES ('General'), ('NUS'), ('Computing') ON CONFLICT DO NOTHING;
		`
	_, err := DB.Exec(query)
	if err != nil {
		log.Fatal("Error creating tables: ", err)
	}
	fmt.Println("Tables created/verified successfully!")
}
