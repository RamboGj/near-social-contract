export interface PostProps {
  timestamp: Date
  author: string
  content: string
}

export interface UserProps {
  username: string
  friends: UserProps[]
  posts: PostProps[]
}