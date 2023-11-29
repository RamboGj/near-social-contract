// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, assert, LookupMap, Vector } from 'near-sdk-js';
import { Post, User } from './model';
import { PostProps, UserProps } from './types';

// REVIEW add_post is not updating users[key].posts
// REVIEW need of having friends LookupMap

@NearBindgen({})
class SocialNear {
  users: LookupMap<UserProps> = new LookupMap<UserProps>("users") // accountId => User
  friends: LookupMap<UserProps[]> = new LookupMap<UserProps[]>("friends") // accountId => User[]
  posts: Vector<PostProps> = new Vector<PostProps>("posts"); // Post[]

  @view({})
  get_all_posts(): PostProps[] {
    near.log(`All posts: ${this.posts.toArray()}`)
    return this.posts.toArray()
  }

  @view({})
  get_post_by_account_id({ accountId }: { accountId: string }): PostProps[] {
    const userExists = verifyUserExistenceView(this.users, accountId)

    if (userExists) {
      near.log("User exists")
      const posts = this.users.get(accountId)?.posts
      near.log(`Specific posts from ${accountId}: ${posts}`)

      return posts
    } else {
      return []
    }
  }

  @view({})
  get_posts_from_user_friends({ accountId }: { accountId: string }): PostProps[] {
    const friendsPosts: PostProps[] = []
    near.log("get_posts_from_user_friends accoutnId: ", accountId)

    const userExists = verifyUserExistenceView(this.users, accountId)
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
  get_user({ accountId }: { accountId: string }): UserProps {
    return this.users.get(accountId)
  } 

  @view({})
  get_user_friends({ accountId }: { accountId: string }): UserProps[] {
    const userExists = verifyUserExistenceView(this.users, accountId)
    assert(userExists, "User is not registered on the platform. Reverting call.")

    const user = this.users.get(accountId)

    const friends = user.friends

    near.log(`${accountId} friends are: ${friends}`)
    return friends
  }

  @call({})
  add_post({ content }: PostProps): void {
    const userExists = verifyUserExistence(this.users)

    assert(userExists, "User is not registered on the platform. Reverting call.")

    const newPost: PostProps = new Post({ author: near.signerAccountId(), content, timestamp: near.blockTimestamp() }) // I need to divide near.blockTimestamp() by 1000000 ( 10**6) on FE

    near.log(`New post: ${newPost}`)

    // Add post to posts array
    // Add post to user posts array
    this.posts.push(newPost)
    const user = this.users.get(near.signerAccountId())
    user.posts.push(newPost)
    this.users.set(near.signerAccountId(), user)
  }

  @call({})
  add_new_friend({ accountId }: { accountId: string }): void {
    const userExists = verifyUserExistence(this.users)

    assert(userExists, "User is not registered on the platform. Reverting call.")
    const userToAddFriend = this.users.get(near.signerAccountId())

    near.log("userToAddFriend", userToAddFriend.username)

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


    // ------ UPDATE USER -------
    // Get user that called function current state
    // update current state
    // set new state for user

    // ------ UPDATE FRIENDS -------
    // Get friends mapping current state
    // update friends current state
    // set new state for user
    const user = this.users.get(near.signerAccountId())
    user.friends.push(friend)
    userFriends.push(friend)

    this.users.set(near.signerAccountId(), user)
    this.friends.set(near.signerAccountId(), userFriends)
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

  return userExists
}

function verifyUserExistenceView(users: LookupMap<UserProps>, accountId: string) {
  const userExists = users.containsKey(accountId)

  return userExists
}