package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/heinlinhtet/forum-backend/database"
	"github.com/heinlinhtet/forum-backend/models"
)

func TopicsHandler(w http.ResponseWriter, r *http.Request) {
	// NTS: Here, remove the topics prefix to see what's left
	// "/topics" -> ""
	// "/topics/1/posts" -> "1/posts"
	subPath := strings.TrimPrefix(r.URL.Path, "/topics")
	parts := strings.Split(strings.Trim(subPath, "/"), "/")

	// Case 1: To be like reddit features, this is to call all topics (subreddits)
	if subPath == "" || subPath == "/" {
		// GET ALL TOPICS
		if r.Method == "GET" {
			rows, err := database.DB.Query("SELECT id, name FROM topics")
			if err != nil {
				http.Error(w, "Error fetching topics. Database error:", 500)
				return
			}
			defer rows.Close()

			var topics []models.Topic
			for rows.Next() {
				var t models.Topic
				err := rows.Scan(&t.Id, &t.Name)
				if err != nil {
					continue
				}
				topics = append(topics, t)
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(topics)
			return
		}

		// CREATE TOPIC
		if r.Method == "POST" {
			var t models.Topic
			err := json.NewDecoder(r.Body).Decode(&t)
			if err != nil {
				http.Error(w, "Invalid JSON", 400)
				return
			}
			if t.Name == "" {
				http.Error(w, "Topic name is required", 400)
				return
			}

			var id int
			err = database.DB.QueryRow("INSERT INTO topics (name) VALUES ($1) RETURNING id", t.Name).Scan(&id)
			if err != nil {
				http.Error(w, "Database error", 500)
				return
			}
			fmt.Fprintf(w, "Created Topic %v", id)
			return
		}
	}

	// Case 2: Specific Topic Actions "/topics/{id}"
	if len(parts) == 1 {
		id, err := strconv.Atoi(parts[0])
		if err != nil {
			http.Error(w, "Method not allowed", 405)
			return
		}

		// RENAME TOPIC (PATCH)
		if r.Method == "PATCH" {
			var t models.Topic
			err := json.NewDecoder(r.Body).Decode(&t)
			if err != nil {
				http.Error(w, "Invalid JSON", 400)
				return
			}

			_, err = database.DB.Exec("UPDATE topics SET name = $1 WHERE id = $2", t.Name, id)
			if err != nil {
				http.Error(w, "Database error", 500)
				return
			}
			fmt.Fprintf(w, "Topic updated")
			return
		}

		// DELETE TOPIC (DELETE)
		if r.Method == "DELETE" {
			// Step A: Delete all comments under the post first (to avoid Foreign Key errors)
			_, _ = database.DB.Exec("DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE topic_id = $1)", id)
			// Step B: Delete all posts in this topic first (to avoid Foreign Key errors, again)
			_, _ = database.DB.Exec("DELETE FROM posts WHERE topic_id = $1", id)
			// Step C: Delete the topic itself
			_, err := database.DB.Exec("DELETE FROM topics WHERE id = $1", id)
			if err != nil {
				http.Error(w, "Database error", 500)
				return
			}
			fmt.Fprintf(w, "Topic deleted")
			return
		}
	}

	// Case 3: Legacy support for "/topics/{id}/posts" (just to keep it safe)
	if len(parts) == 2 && parts[1] == "posts" && r.Method == "GET" {
		topicId, _ := strconv.Atoi(parts[0])
		rows, err := database.DB.Query("SELECT id, topic_id, title, description, username, created_at FROM posts WHERE topic_id = $1", topicId)
		if err != nil {
			http.Error(w, "Database error", 500)
			return
		}
		defer rows.Close()

		var posts []models.Post
		for rows.Next() {
			var p models.Post
			err = rows.Scan(&p.Id, &p.TopicId, &p.Title, &p.Description, &p.Username, &p.CreatedAt)
			if err != nil {
				continue
			}
			posts = append(posts, p)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
		return
	}
}
