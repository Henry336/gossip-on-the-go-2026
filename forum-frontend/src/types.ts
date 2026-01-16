export interface Post {
  id:          number;
  topic_id:     number;
  title:       string;
  description: string;
  username:    string;
  createdAt:   string;
}

export interface Comment {
    id:        number;
    post_id:    number;
    content:   string;
    username:  string;
    createdAt: string;
}

export interface Topic {
    id: number;
    name: string;
}