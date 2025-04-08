import {
  type User, type InsertUser,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type Reaction, type InsertReaction,
  type Message, type InsertMessage,
  type Story, type InsertStory,
  type Group, type InsertGroup,
  type GroupMember, type InsertGroupMember,
  type GroupMessage, type InsertGroupMessage,
  type Friend, type InsertFriend
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  
  // Reaction methods
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  getReactionsByPostId(postId: number): Promise<Reaction[]>;
  getReactionByUserAndPost(userId: number, postId: number): Promise<Reaction | undefined>;
  removeReaction(userId: number, postId: number): Promise<void>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userOneId: number, userTwoId: number): Promise<Message[]>;
  getMessagesByReceiverId(receiverId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{user: User, lastMessage: Message}[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByUserId(userId: number): Promise<Story[]>;
  getStoriesByFriends(userId: number): Promise<Story[]>;
  
  // Friend methods
  createFriendRequest(request: InsertFriend): Promise<Friend>;
  getFriendRequestByUsers(userId: number, friendId: number): Promise<Friend | undefined>;
  getFriendsByUserId(userId: number): Promise<Friend[]>;
  updateFriendStatus(id: number, status: string): Promise<Friend>;
  
  // Group methods
  createGroup(group: InsertGroup): Promise<Group>;
  getGroupById(id: number): Promise<Group | undefined>;
  getGroups(): Promise<Group[]>;
  
  // Group member methods
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  
  // Group message methods
  createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage>;
  getGroupMessages(groupId: number): Promise<GroupMessage[]>;
}

export class MemStorage implements IStorage {
  // Store data
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private reactions: Map<number, Reaction>;
  private messages: Map<number, Message>;
  private stories: Map<number, Story>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private groupMessages: Map<number, GroupMessage>;
  private friends: Map<number, Friend>;
  
  // ID counters
  private userIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;
  private reactionIdCounter: number;
  private messageIdCounter: number;
  private storyIdCounter: number;
  private groupIdCounter: number;
  private groupMemberIdCounter: number;
  private groupMessageIdCounter: number;
  private friendIdCounter: number;
  
  // Session store
  public sessionStore: session.Store;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.reactions = new Map();
    this.messages = new Map();
    this.stories = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.groupMessages = new Map();
    this.friends = new Map();
    
    // Initialize counters
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.reactionIdCounter = 1;
    this.messageIdCounter = 1;
    this.storyIdCounter = 1;
    this.groupIdCounter = 1;
    this.groupMemberIdCounter = 1;
    this.groupMessageIdCounter = 1;
    this.friendIdCounter = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Post methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: new Date() 
    };
    this.posts.set(id, post);
    return post;
  }
  
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Comment methods
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }
  
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  // Reaction methods
  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    // Check if reaction already exists
    const existingReaction = await this.getReactionByUserAndPost(
      insertReaction.userId,
      insertReaction.postId
    );
    
    if (existingReaction) {
      // Update the existing reaction type
      const updatedReaction: Reaction = {
        ...existingReaction,
        type: insertReaction.type
      };
      this.reactions.set(existingReaction.id, updatedReaction);
      return updatedReaction;
    }
    
    // Create a new reaction
    const id = this.reactionIdCounter++;
    const reaction: Reaction = {
      ...insertReaction,
      id
    };
    this.reactions.set(id, reaction);
    return reaction;
  }
  
  async getReactionsByPostId(postId: number): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.postId === postId);
  }
  
  async getReactionByUserAndPost(userId: number, postId: number): Promise<Reaction | undefined> {
    return Array.from(this.reactions.values())
      .find(reaction => reaction.userId === userId && reaction.postId === postId);
  }
  
  async removeReaction(userId: number, postId: number): Promise<void> {
    const reaction = await this.getReactionByUserAndPost(userId, postId);
    if (reaction) {
      this.reactions.delete(reaction.id);
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      read: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesBetweenUsers(userOneId: number, userTwoId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userOneId && message.receiverId === userTwoId) ||
        (message.senderId === userTwoId && message.receiverId === userOneId)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getMessagesByReceiverId(receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === receiverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getConversations(userId: number): Promise<{user: User, lastMessage: Message}[]> {
    // Get all messages where user is sender or receiver
    const userMessages = Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId);
    
    // Get unique user IDs from these messages
    const conversationUserIds = new Set<number>();
    userMessages.forEach(message => {
      const otherId = message.senderId === userId ? message.receiverId : message.senderId;
      conversationUserIds.add(otherId);
    });
    
    // For each conversation user, find the latest message
    const conversations: {user: User, lastMessage: Message}[] = [];
    
    for (const otherId of conversationUserIds) {
      const user = await this.getUser(otherId);
      if (!user) continue;
      
      const messagesBetween = await this.getMessagesBetweenUsers(userId, otherId);
      if (messagesBetween.length === 0) continue;
      
      const lastMessage = messagesBetween[messagesBetween.length - 1];
      
      conversations.push({
        user,
        lastMessage
      });
    }
    
    // Sort by most recent message
    return conversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }
  
  async markMessageAsRead(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      this.messages.set(messageId, {...message, read: true});
    }
  }
  
  // Story methods
  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.storyIdCounter++;
    const story: Story = {
      ...insertStory,
      id,
      createdAt: new Date()
    };
    this.stories.set(id, story);
    return story;
  }
  
  async getStoriesByUserId(userId: number): Promise<Story[]> {
    const now = new Date();
    return Array.from(this.stories.values())
      .filter(story => 
        story.userId === userId && 
        new Date(story.expiresAt) > now
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getStoriesByFriends(userId: number): Promise<Story[]> {
    const now = new Date();
    const friendships = await this.getFriendsByUserId(userId);
    const friendIds = friendships
      .filter(f => f.status === 'accepted')
      .map(f => f.userId === userId ? f.friendId : f.userId);
    
    return Array.from(this.stories.values())
      .filter(story => 
        friendIds.includes(story.userId) && 
        new Date(story.expiresAt) > now
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Friend methods
  async createFriendRequest(insertFriend: InsertFriend): Promise<Friend> {
    const id = this.friendIdCounter++;
    const friendRequest: Friend = {
      ...insertFriend,
      id
    };
    this.friends.set(id, friendRequest);
    return friendRequest;
  }
  
  async getFriendRequestByUsers(userId: number, friendId: number): Promise<Friend | undefined> {
    return Array.from(this.friends.values())
      .find(friend => 
        (friend.userId === userId && friend.friendId === friendId) ||
        (friend.userId === friendId && friend.friendId === userId)
      );
  }
  
  async getFriendsByUserId(userId: number): Promise<Friend[]> {
    return Array.from(this.friends.values())
      .filter(friend => friend.userId === userId || friend.friendId === userId);
  }
  
  async updateFriendStatus(id: number, status: string): Promise<Friend> {
    const friend = this.friends.get(id);
    if (!friend) {
      throw new Error(`Friend request with id ${id} not found`);
    }
    
    const updatedFriend: Friend = {
      ...friend,
      status
    };
    
    this.friends.set(id, updatedFriend);
    return updatedFriend;
  }
  
  // Group methods
  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.groupIdCounter++;
    const group: Group = {
      ...insertGroup,
      id,
      createdAt: new Date()
    };
    this.groups.set(id, group);
    return group;
  }
  
  async getGroupById(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }
  
  // Group member methods
  async addGroupMember(insertMember: InsertGroupMember): Promise<GroupMember> {
    const id = this.groupMemberIdCounter++;
    const member: GroupMember = {
      ...insertMember,
      id
    };
    this.groupMembers.set(id, member);
    return member;
  }
  
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
  }
  
  // Group message methods
  async createGroupMessage(insertMessage: InsertGroupMessage): Promise<GroupMessage> {
    const id = this.groupMessageIdCounter++;
    const message: GroupMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.groupMessages.set(id, message);
    return message;
  }
  
  async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
    return Array.from(this.groupMessages.values())
      .filter(message => message.groupId === groupId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

export const storage = new MemStorage();
