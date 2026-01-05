package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/heinlinhtet/forum-backend/database"
	"github.com/heinlinhtet/forum-backend/models"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var u models.User
	err := json.NewDecoder(r.Body).Decode(&u)
	if err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	_, err = database.DB.Exec("INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING", u.Username)
	if err != nil {
		http.Error(w, "Database error", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful", "username": u.Username})
}
