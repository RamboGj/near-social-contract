import { PostProps, UserProps } from "./types";

export class Post {
  timestamp: Date
  author: string
  content: string

  constructor({ author, content, timestamp }: Post) {
    this.author = author;
    this.content = content;
    this.timestamp = timestamp;
  }
}

export class User {
  username: string
  friends: UserProps[]
  posts: PostProps[]

  constructor({ username }: Pick<User, 'username'>) {
    this.username = username
    this.friends = []
    this.posts = []
  }
}
  
