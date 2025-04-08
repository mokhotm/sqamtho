import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import WebSocket, { WebSocketServer } from "ws";
import { 
  insertPostSchema, 
  insertCommentSchema, 
  insertReactionSchema,
  insertMessageSchema
} from "@shared/schema";
import { z } from "zod";

interface ClientConnection {
  userId: number;
  socket: WebSocket;
}

const clients: ClientConnection[] = [];

function setupWebSockets(server: Server) {
  // Use correct WebSocket server path and ensure proper CORS settings
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    // Allow all origins in development
    verifyClient: () => true
  });
  
  console.log('WebSocket server initialized at /ws');
  
  wss.on('connection', (socket, req) => {
    console.log('New WebSocket connection established');
    
    // Handle new connections
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data.type);
        
        // Handle authentication
        if (data.type === 'auth') {
          const userId = data.userId;
          if (userId) {
            // Store the connection with the user ID
            clients.push({ userId, socket });
            
            // Send acknowledgment
            socket.send(JSON.stringify({ type: 'auth_success' }));
            console.log(`User ${userId} authenticated via WebSocket`);
          }
        }
        
        // Handle chat messages
        if (data.type === 'chat_message' && data.message) {
          const { senderId, receiverId, content } = data.message;
          console.log(`Chat message from ${senderId} to ${receiverId}: ${content.substring(0, 20)}...`);
          
          // Save message to storage
          storage.createMessage({
            senderId,
            receiverId,
            content
          }).then(savedMessage => {
            // Find receiver's connections
            const receiverConnections = clients.filter(client => client.userId === receiverId);
            
            // Send the message to all receiver's connections
            receiverConnections.forEach(client => {
              if (client.socket.readyState === WebSocket.OPEN) {
                client.socket.send(JSON.stringify({
                  type: 'new_message',
                  message: savedMessage
                }));
              }
            });
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Send a welcome message for testing connection
    socket.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Connected to Sqamtho WebSocket server' 
    }));
    
    // Handle disconnections
    socket.on('close', () => {
      // Remove the closed connection
      const index = clients.findIndex(client => client.socket === socket);
      if (index !== -1) {
        clients.splice(index, 1);
        console.log('WebSocket connection closed, client removed');
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSockets
  setupWebSockets(httpServer);
  
  // ===== Posts API =====
  
  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      
      // For each post, get author, comments, and reactions
      const postsWithDetails = await Promise.all(posts.map(async (post) => {
        const author = await storage.getUser(post.userId);
        const comments = await storage.getCommentsByPostId(post.id);
        const reactions = await storage.getReactionsByPostId(post.id);
        
        // Get comment authors
        const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
          const commentAuthor = await storage.getUser(comment.userId);
          return {
            ...comment,
            author: commentAuthor ? {
              id: commentAuthor.id,
              username: commentAuthor.username,
              displayName: commentAuthor.displayName,
              profilePicture: commentAuthor.profilePicture
            } : null
          };
        }));
        
        return {
          ...post,
          author: author ? {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            profilePicture: author.profilePicture
          } : null,
          comments: commentsWithAuthor,
          reactions: {
            count: reactions.length,
            types: countReactionTypes(reactions)
          }
        };
      }));
      
      res.json(postsWithDetails);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Create a new post
  app.post("/api/posts", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const post = await storage.createPost(postData);
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Get a single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const author = await storage.getUser(post.userId);
      const comments = await storage.getCommentsByPostId(post.id);
      const reactions = await storage.getReactionsByPostId(post.id);
      
      // Get comment authors
      const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
        const commentAuthor = await storage.getUser(comment.userId);
        return {
          ...comment,
          author: commentAuthor ? {
            id: commentAuthor.id,
            username: commentAuthor.username,
            displayName: commentAuthor.displayName,
            profilePicture: commentAuthor.profilePicture
          } : null
        };
      }));
      
      const postWithDetails = {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          profilePicture: author.profilePicture
        } : null,
        comments: commentsWithAuthor,
        reactions: {
          count: reactions.length,
          types: countReactionTypes(reactions)
        }
      };
      
      res.json(postWithDetails);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // ===== Comments API =====
  
  // Add a comment to a post
  app.post("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        postId,
        userId: req.user.id,
        content: req.body.content
      });
      
      const comment = await storage.createComment(commentData);
      const author = await storage.getUser(comment.userId);
      
      const commentWithAuthor = {
        ...comment,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          profilePicture: author.profilePicture
        } : null
      };
      
      res.status(201).json(commentWithAuthor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  // Get comments for a post
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      
      // Get comment authors
      const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
        const author = await storage.getUser(comment.userId);
        return {
          ...comment,
          author: author ? {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            profilePicture: author.profilePicture
          } : null
        };
      }));
      
      res.json(commentsWithAuthor);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // ===== Reactions API =====
  
  // Add or update a reaction to a post
  app.post("/api/posts/:postId/reactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const reactionData = insertReactionSchema.parse({
        postId,
        userId: req.user.id,
        type: req.body.type
      });
      
      const reaction = await storage.createReaction(reactionData);
      
      res.status(201).json(reaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });
  
  // Remove a reaction from a post
  app.delete("/api/posts/:postId/reactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      
      await storage.removeReaction(req.user.id, postId);
      
      res.status(200).json({ message: "Reaction removed" });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });
  
  // ===== Messages API =====
  
  // Get conversations for the authenticated user
  app.get("/api/conversations", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const conversations = await storage.getConversations(req.user.id);
      
      // Format the response
      const formattedConversations = conversations.map(conv => ({
        user: {
          id: conv.user.id,
          username: conv.user.username,
          displayName: conv.user.displayName,
          profilePicture: conv.user.profilePicture
        },
        lastMessage: {
          id: conv.lastMessage.id,
          content: conv.lastMessage.content,
          senderId: conv.lastMessage.senderId,
          receiverId: conv.lastMessage.receiverId,
          read: conv.lastMessage.read,
          createdAt: conv.lastMessage.createdAt
        },
        isOnline: isUserOnline(conv.user.id) // Check if user is connected to WebSocket
      }));
      
      res.json(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get messages between the authenticated user and another user
  app.get("/api/messages/:userId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const otherUserId = parseInt(req.params.userId);
      const messages = await storage.getMessagesBetweenUsers(req.user.id, otherUserId);
      
      // Mark messages as read if the authenticated user is the receiver
      await Promise.all(messages.map(async (message) => {
        if (message.receiverId === req.user.id && !message.read) {
          await storage.markMessageAsRead(message.id);
        }
      }));
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Send a message
  app.post("/api/messages", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const messageData = insertMessageSchema.parse({
        senderId: req.user.id,
        receiverId: req.body.receiverId,
        content: req.body.content
      });
      
      const message = await storage.createMessage(messageData);
      
      // Notify the receiver through WebSocket if online
      const receiverConnections = clients.filter(client => client.userId === messageData.receiverId);
      
      receiverConnections.forEach(client => {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify({
            type: 'new_message',
            message
          }));
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // ===== Friends API =====
  
  // Get friends for the authenticated user
  app.get("/api/friends", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendships = await storage.getFriendsByUserId(req.user.id);
      
      // Get the friend details
      const friendsWithDetails = await Promise.all(friendships.map(async (friendship) => {
        const friendId = friendship.userId === req.user.id ? friendship.friendId : friendship.userId;
        const friend = await storage.getUser(friendId);
        
        return {
          id: friendship.id,
          status: friendship.status,
          friend: friend ? {
            id: friend.id,
            username: friend.username,
            displayName: friend.displayName,
            profilePicture: friend.profilePicture,
            isOnline: isUserOnline(friend.id)
          } : null,
          isRequester: friendship.userId === req.user.id
        };
      }));
      
      res.json(friendsWithDetails);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });
  
  // Send a friend request
  app.post("/api/friends", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendId = req.body.friendId;
      
      // Check if the friend exists
      const friend = await storage.getUser(friendId);
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if a friend request already exists
      const existingRequest = await storage.getFriendRequestByUsers(req.user.id, friendId);
      if (existingRequest) {
        return res.status(409).json({ message: "Friend request already exists" });
      }
      
      // Create friend request
      const friendRequest = await storage.createFriendRequest({
        userId: req.user.id,
        friendId,
        status: 'pending'
      });
      
      res.status(201).json(friendRequest);
    } catch (error) {
      console.error('Error creating friend request:', error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });
  
  // Accept or reject a friend request
  app.put("/api/friends/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const requestId = parseInt(req.params.id);
      const status = req.body.status;
      
      // Validate status
      if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if the friend request exists
      const friendRequest = await storage.getFriendsByUserId(req.user.id)
        .then(friends => friends.find(f => f.id === requestId));
      
      if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      // Check if the user is the receiver of the request
      if (friendRequest.friendId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }
      
      // Update the request status
      const updatedRequest = await storage.updateFriendStatus(requestId, status);
      
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating friend request:', error);
      res.status(500).json({ message: "Failed to update friend request" });
    }
  });
  
  // Helper function to count reaction types
  function countReactionTypes(reactions: any[]) {
    const counts: Record<string, number> = {};
    
    reactions.forEach(reaction => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    
    return counts;
  }
  
  // Helper function to check if a user is online
  function isUserOnline(userId: number): boolean {
    return clients.some(client => client.userId === userId);
  }

  return httpServer;
}
