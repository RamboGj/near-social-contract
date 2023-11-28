import { AccountId } from "near-sdk-js"

export interface PostProps {
  timestamp: bigint
  author: AccountId
  content: string
}

export interface UserProps {
  username: AccountId
  friends: UserProps[]
  posts: PostProps[]
}