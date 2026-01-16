export interface Post {
  id:          number;
  topic_id:     number;
  title:       string;
  description: string;
  username:    string;
  created_at:   string;
}

export interface Comment {
    id:        number;
    post_id:    number;
    content:   string;
    username:  string;
    created_at: string;
}

export interface Topic {
    id: number;
    name: string;
}