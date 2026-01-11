package models

import "time"

type Topic struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type Post struct {
	Id          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	TopicId     int       `json:"topic_id"`
	Username    string    `json:"username"` // Added from Auth update
}

type Comment struct {
	Id        int       `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	PostId    int       `json:"post_id"`
	Username  string    `json:"username"` // Added from Auth update
}

type User struct {
	Username string `json:"username"`
}
