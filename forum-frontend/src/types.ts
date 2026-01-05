export interface Post {
  Id:          number;
  TopicId:     number;
  Title:       string;
  Description: string;
  Username:    string;
  CreatedAt:   string;
}

export interface Comment {
    Id:        number;
    PostId:    number;
    Content:   string;
    Username:  string;
    CreatedAt: string;
}

export interface Topic {
    Id: number;
    Name: string;
}