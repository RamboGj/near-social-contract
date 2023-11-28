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
  // TO-DO verify users, state is not changing
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
    const userExists = verifyUserExistence(this.users)

    if (userExists) {
      near.log("User exists")
      const posts = this.users.get(username)?.posts
      near.log(`Specific posts from ${username}: ${posts}`)

      return posts
    } else {
      return []
    }
  }

  @view({})
  get_posts_from_user_friends(accountId: AccountId): PostProps[] {
    const friendsPosts: PostProps[] = []
    near.log("get_posts_from_user_friends accoutnId: ", accountId)

    const userExists = verifyUserExistence(this.users)
    assert(userExists, "User is not registered on the platform. Reverting call.")

    const user = this.users.get(accountId)
    near.log("User: " + user)

    const userFriends = this.friends.get(accountId)
    near.log("userFriends", userFriends)

    if (userFriends.length > 0) {
      userFriends.forEach(({ posts }) => {
        friendsPosts.push(...posts)
      })
      near.log("friendsPosts: " + friendsPosts)
      return friendsPosts
    } else {
      return []
    }
  }

  @view({})
  get_user(accountId: string): UserProps {
    // TO-DO verify why it`s returning null
    near.log("accountId =>", accountId)

    near.log("get_user accountId:", accountId)
    near.log("getter", this.users.get(accountId))
    return this.users.get(accountId)
  } 

  @view({})
  get_user_friends(accountId: AccountId): UserProps[] {
    const userExists = verifyUserExistence(this.users)
    assert(userExists, "User is not registered on the platform. Reverting call.")

    const user = this.users.get(accountId)

    const friends = user.friends

    near.log(`${accountId} friends are: ${friends}`)
    return friends
  }

  @call({})
  add_post({ content }: PostProps): void {
    near.log(`Before verifyUserExistence: ${this.users}`)

    const userExists = verifyUserExistence(this.users)

    near.log(`After verifyUserExistence: ${this.users}`)

    assert(userExists, "User is not registered on the platform. Reverting call.")

    const newPost: PostProps = new Post({ author: near.signerAccountId(), content, timestamp: near.blockTimestamp() }) // I need to divide near.blockTimestamp() by 1000000 ( 10**6) on FE

    near.log(`New post: ${newPost}`)

    // Add post to posts array
    // Add post to user posts array
    this.posts.push(newPost)
    this.users.get(near.signerAccountId()).posts.push(newPost)
  }

  @call({})
  add_new_friend(accountId: AccountId): void {
    // TO-DO update friends mapping (friends.set)
    const userExists = verifyUserExistence(this.users)

    assert(userExists, "User is not registered on the platform. Reverting call.")
    const userToAddFriend = this.users.get(near.signerAccountId())

    near.log("userToAddFriend", userToAddFriend)

    const friendAlreadyAdded = userToAddFriend.friends.filter((friend) => {
      return friend.username === accountId
    }).length > 0 ? true : false

    assert(!friendAlreadyAdded, "Friend already added. Reverting call.")

    const friendToAddExists = this.friends.containsKey(accountId)

    assert(friendToAddExists, "User does not exist. Reverting call.")

    const friend = this.users.get(accountId)

    let userFriends = this.friends.get(near.signerAccountId())

    if (userFriends === null) {
      userFriends = []
    }

    userFriends.push(friend)

    userToAddFriend.friends.push(friend)
    this.friends.set(accountId, userFriends)
  }

  // call this when user connect wallet for the first time
  @call({})
  create_user(): void {
    const userExists = verifyUserExistence(this.users)

    assert(!userExists, "User already exist. Reverting call.")

    const newUser = new User({ username: near.signerAccountId() })

    near.log("create_user near.signerAccountId()", near.signerAccountId())
    near.log("newUser", newUser)

    near.log('users', this.users)
    this.users.set(near.signerAccountId(), newUser)
  }
}

function verifyUserExistence(users: LookupMap<UserProps>) {
  const userExists = users.containsKey(near.signerAccountId())

  const getUser = users.get(near.signerAccountId())
  const getUserWithString = users.get("rambogj.testnet")
  near.log("user", userExists)
  near.log("getUser", getUser)
  near.log("getUserWithString", getUserWithString)
  near.log("verifyUserExistence near.signerAccountId()", near.signerAccountId())

  return userExists
}