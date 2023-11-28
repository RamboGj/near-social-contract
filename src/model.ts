import { AccountId } from "near-sdk-js";
import { PostProps, UserProps } from "./types";

export class Post {
  author: AccountId
  timestamp: bigint
  content: string

  constructor({ author, content, timestamp }: Post) {
    this.author = author;
    this.content = content;
    this.timestamp = timestamp;
  }
}

export class User {
  username: AccountId
  friends: UserProps[]
  posts: PostProps[]

  constructor({ username }: Pick<User, 'username'>) {
    this.username = username
    this.friends = []
    this.posts = []
  }
}
  
