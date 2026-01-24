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

	// DropTables()
	// NTS: This is only to bypass the firewall and drop tables if needed!

	createTables()

	// TEMPORARY SEEDING CODE
	// NTS: This runs automatically when the server starts on Render. (Why? Cuz I couldn't bypass NUS wifi's firewall - and my laptop cannot connect to my mobile hotspot)
	seedQuery := `
		-- First, insert users
		INSERT INTO users (username) VALUES ('Henry') ON CONFLICT (username) DO NOTHING;
		INSERT INTO users (username) VALUES ('Anonymous') ON CONFLICT (username) DO NOTHING;

		-- Delete existing topics first to avoid conflicts
		DELETE FROM topics;

		-- Insert topics with explicit IDs
		INSERT INTO topics (id, name) VALUES 
    		(1, 'General'), 
    		(2, 'NUS'), 
    		(3, 'Computing'), 
    		(4, 'Engineering');

		-- Reset the sequence to start from 5
		SELECT setval('topics_id_seq', 5, false);
		`
	_, seedErr := DB.Exec(seedQuery)
	if seedErr != nil {
		// NTS: What's happening here? "Log it but don't crash, just in case tables are weird"
		fmt.Println("Seeding Warning:", seedErr)
	} else {
		fmt.Println("✅ DATABASE SUCCESSFULLY SEEDED WITH CORRECT IDs!")
	}
}

func DropTables() {
	query := `
        DROP TABLE IF EXISTS comments CASCADE;
        DROP TABLE IF EXISTS posts CASCADE;
        DROP TABLE IF EXISTS topics CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
    `
	_, err := DB.Exec(query)
	if err != nil {
		log.Fatal("Error dropping tables: ", err)
	}
	fmt.Println("✅ TABLES DROPPED SUCCESSFULLY!")
}

func createTables() {
	query := `
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(50) PRIMARY KEY
        );
        
        CREATE TABLE IF NOT EXISTS topics (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            username VARCHAR(50) REFERENCES users(username),
            topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            username VARCHAR(50) REFERENCES users(username),
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
	_, err := DB.Exec(query)
	if err != nil {
		log.Fatal("Error creating tables: ", err)
	}
	fmt.Println("Tables created/verified successfully!")
}
