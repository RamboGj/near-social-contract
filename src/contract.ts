// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, assert, LookupMap, Vector, AccountId } from 'near-sdk-js';
import { Post, User } from './model';
import { PostProps, UserProps } from './types';

// Social Midia Smart Contract with Near to connect with RE-NFT test

// REQUIREMENTS:
/*
 - GET all posts - DONE
 - GET specific user posts - DONE
 - CALL create new post - DONE

 - GET friends from user - DONE
 - GET posts from user friends - DONE
 - CALL add friend - DONE

 - CALL create user - DONE
*/
@NearBindgen({})
class SocialNear {
  users: LookupMap<UserProps> = new LookupMap<UserProps>("accountId") // accountId => User
  friends: LookupMap<UserProps[]> = new LookupMap<UserProps[]>("accountId") // accountId => User[]
  posts: Vector<PostProps> = new Vector<PostProps>("v-uid"); // Post[]

  @view({})
  get_all_posts(): PostProps[] {
    near.log(`All posts: ${this.posts.toArray()}`)
    return this.posts.toArray()
  }

  @view({})
  get_post_by_user(username: string): PostProps[] {
    const posts = this.users.get(username).posts

    near.log(`Specific posts from ${username}: ${posts}`)
    return posts
  }

  @view({})
  get_posts_from_user_friends(): PostProps[] {
    const friendsPosts: PostProps[] = []

    const user = this.users.get(near.signerAccountId())
    near.log("User: " + user)

    const userFriends = this.friends.get(near.signerAccountId())
    near.log("userFriends", userFriends)

    userFriends.forEach(({ posts }) => {
      friendsPosts.push(...posts)
    })

    near.log("friendsPosts: " + friendsPosts)
    return friendsPosts
  }

  @view({})
  get_user(accountId: AccountId): UserProps {
    near.log(this.users.get(accountId))
    return this.users.get(accountId)
  } 

  @view({})
  get_user_friends(accountId: AccountId): UserProps[] {
    const user = this.users.get(accountId)

    const friends = user.friends

    near.log(`${accountId} friends are: ${friends}`)
    return friends
  }

  @call({})
  add_post({ content }: PostProps): void {
    const userExists = verifyUserExistence(this.users)

    assert(userExists, "User is not registered on the platform.")

    const newPost: PostProps = new Post({ author: near.signerAccountId(), content, timestamp: near.blockTimestamp() }) // I need to divide near.blockTimestamp() by 1000000 ( 10**6) on FE

    near.log(`New post: ${newPost}`)

    // Add post to posts array
    // Add post to user posts array
    this.posts.push(newPost)
    this.users.get(near.signerAccountId()).posts.push(newPost)
  }

  @call({})
  add_new_friend(accountId: AccountId): void {
    const userToAddFriend = this.users.get(near.signerAccountId())

    near.log("userToAddFriend", userToAddFriend)

    const friendAlreadyAdded = userToAddFriend.friends.filter((friend) => {
      return friend.username === accountId
    }).length > 0 ? true : false


    assert(!friendAlreadyAdded, "Friend already added. Reverting call.")

    const friend = this.users.get(accountId)

    // Add friend to user friends array
    userToAddFriend.friends.push(friend)
  }

  // call this when user connect wallet for the first time
  @call({})
  create_user(): void {
    const userExists = verifyUserExistence(this.users)

    assert(!userExists, "User already exist. Reverting call.")

    const newUser = new User({ username: near.signerAccountId() })
    this.users.set(near.signerAccountId(), newUser)
  }
}

function verifyUserExistence(users: LookupMap<UserProps>) {
  const userExists = users.containsKey(near.signerAccountId())

  near.log("user", userExists)
  near.log("users.get(near.signerAccountId())", users.get(near.signerAccountId()))

  return userExists
}