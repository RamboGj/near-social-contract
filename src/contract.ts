// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view } from 'near-sdk-js';
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
  posts: PostProps[] = []
  users: UserProps[] = []

  @view({})
  get_all_posts(): PostProps[] {
    near.log(`All posts: ${this.posts}`)
    return this.posts
  }

  @view({})
  get_post_by_user(username: string): PostProps[] {
    const userPosts = this.posts.filter((post) => {
      return post.author === username
    })

    near.log(`Specific posts from ${username}: ${JSON.stringify(userPosts, null, 2)}`)
    return userPosts
  }

  @view({})
  get_user_friends(username: string): UserProps[] {
    const user = this.users.filter((user) => {
      return user.username === near.signerAccountId()
    })[0]

    const friends = user.friends

    near.log(`${username} friends are: ${JSON.stringify(friends, null, 2)}`)
    return friends
  }

  @view({})
  get_posts_from_user_friends(): PostProps[] {
    const friendsPosts: PostProps[] = []

    const user = this.users.filter((user) => {
      return user.username === near.signerAccountId()
    })[0]
    near.log("User: " + user)

    const friends = user.friends
    near.log("friends: " + friends)

    friends.forEach(({ posts }) => {
      friendsPosts.push(...posts)
    })

    near.log("friendsPosts: " + friendsPosts)
    return friendsPosts
  }

  @call({})
  add_new_post({ content, timestamp }: PostProps): void {
    const newPost: PostProps = new Post({ author: near.signerAccountId(), content, timestamp })

    near.log(`New post: ${newPost}`)
    this.posts.push(newPost)
  }

  @call({})
  add_new_friend({ username }: UserProps): void {
    const userToAddFriend = this.users.filter((user) => {
      return user.username === near.signerAccountId()
    })[0]

    const friendAlreadyAdded = userToAddFriend.friends.filter((friend) => {
      return friend.username === username
    }).length > 0 ? true : false


    if (friendAlreadyAdded) {
      throw new Error("Friend already added. Reverting call")
    }

    const friend = this.users.filter((user) => {
      return user.username === username
    })[0]

    userToAddFriend.friends.push(friend)
  }

  // call this when user connect wallet for the first time
  @call({})
  create_user(): void {
    const userAlreadyExists = this.users.filter((user) => {
      return user.username === near.signerAccountId()
    }).length > 0 ? true : false

    if (userAlreadyExists) {
      throw new Error("User already exist. Reverting call")
    }

    const newUser = new User({ username: near.signerAccountId() })
    this.users.push(newUser)
  }
}