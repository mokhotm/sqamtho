import express from 'express';
import { storage } from '../storage.js';
import { friends, users, type User } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';
import { db } from '../db.js';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const router = express.Router();

export default router;

type FriendResponse = Pick<User, 'id' | 'username' | 'displayName' | 'profilePicture'> & { status: string };

// Get all friends for the current user
router.get('/friends', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user

  try {
    const { rows: userFriends } = await db.execute(sql<FriendResponse[]>`
      SELECT 
        u.id,
        u.username,
        u.display_name as "displayName",
        u.profile_picture as "profilePicture",
        f.status
      FROM friends f
      LEFT JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ${userId} AND f.status = 'accepted'
    `);

    res.json(userFriends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all friend requests for the current user
router.get('/friend-requests', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user

  try {
    console.log(`Attempting to fetch friend requests for user ID: ${userId}`);
    const query = sql`
      SELECT u.id, u.username, u.display_name as "displayName", u.profile_picture as "profilePicture"
      FROM friends f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = ${userId} AND f.status = 'pending'
    `;
    console.log('Executing SQL Query:', query); // Log the query object
    const friendRequests = await db.execute(query);

    console.log('Raw Query Result:', friendRequests);
    console.log('Query Result Rows:', friendRequests.rows);
    console.log(`Number of friend requests found: ${friendRequests.rows.length}`);
    console.log('Raw database result for friend requests:', friendRequests);
    console.log('Friend requests fetched successfully. Number of rows:', friendRequests.rows.length);
    res.json(friendRequests.rows);
  } catch (error) {
    console.error(`Error fetching friend requests for user ID ${userId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friend suggestions for the current user
router.get('/friend-suggestions', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user

  try {
    console.log(`Fetching friend suggestions for user ${userId}...`); // Added log
    const suggestions = await db.execute(sql`
      SELECT u.id, u.username, u.display_name as "displayName", u.profile_picture as "profilePicture"
      FROM users u
      LEFT JOIN friends f ON
        (f.user_id = ${userId} AND f.friend_id = u.id) OR
        (f.friend_id = ${userId} AND f.user_id = u.id)
      WHERE f.id IS NULL AND u.id != ${userId} -- Exclude the logged-in user
    `);

    console.log('Suggestions raw result:', suggestions); // Added log
    console.log('Suggestions rows:', suggestions.rows); // Added log

    res.json(suggestions.rows);
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a friend request
router.post('/friend-requests/:friendId', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user
  const friendId = parseInt(req.params.friendId);

  console.log(`Received friend request from user ${userId} to user ${friendId}`);

  if (userId === friendId) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
  }

  console.log(`Received POST request to /api/friend-requests/${friendId} from user ${userId}`);

  try {
    console.log('Attempting to send friend request...');
    console.log('Checking for existing friendship...');
    const { rows: existingFriendship } = await db.execute(sql`
      SELECT *
      FROM friends
      WHERE (user_id = ${userId} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${userId})
    `);

    console.log('Existing friendship query result:', existingFriendship);

    if (existingFriendship.length > 0) {
      console.log(`Friend request already exists between user ${userId} and user ${friendId}`);
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    console.log(`Inserting friend request: userId = ${userId}, friendId = ${friendId}`);
    await db.execute(sql`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES (${userId}, ${friendId}, 'pending')
    `);

    console.log(`Friend request successfully inserted: userId = ${userId}, friendId = ${friendId}`);
    console.log('Friend request successfully inserted.');
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error(`Error sending friend request for user ${userId} to user ${friendId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a friend request
router.post('/friend-request/:friendId/accept', async (req, res) => {
  console.log(`Received POST request to /friend-request/:friendId/accept for friendId: ${req.params.friendId}`);
  const userId = req.user.id; // Get user ID from req.user
  const friendId = parseInt(req.params.friendId);

  try {
    const { rows: result } = await db.execute(sql`
      UPDATE friends
      SET status = 'accepted'
      WHERE user_id = ${friendId} AND friend_id = ${userId}
      RETURNING *
    `);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Create the reverse friendship
    await db.execute(sql`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES (${userId}, ${friendId}, 'accepted')
    `);

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a friend request
router.delete('/friend-request/:friendId', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user
  const friendId = parseInt(req.params.friendId);

  try {
    const { rows: result } = await db.execute(sql`
      DELETE FROM friends
      WHERE user_id = ${friendId} AND friend_id = ${userId} AND status = 'pending'
      RETURNING *
    `);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a friend
router.delete('/friend/:friendId', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user
  const friendId = parseInt(req.params.friendId);

  try {
    const { rows: result } = await db.execute(sql`
      DELETE FROM friends
      WHERE (
        (user_id = ${userId} AND friend_id = ${friendId} AND status = 'accepted')
        OR
        (user_id = ${friendId} AND friend_id = ${userId} AND status = 'accepted')
      )
      RETURNING *
    `);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search for users by username or display name
router.get('/search', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user
  const query = req.query.q as string;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    console.log(`Searching for users matching: ${query}`);
    
    // Use ILIKE for case-insensitive search
    const searchTerm = `%${query}%`;
    
    const { rows: users } = await db.execute(sql<FriendResponse[]>`
      WITH friend_status AS (
        SELECT 
          friend_id,
          status
        FROM friends
        WHERE user_id = ${userId}
        
        UNION
        
        SELECT 
          user_id as friend_id,
          status
        FROM friends
        WHERE friend_id = ${userId}
      )
      
      SELECT 
        u.id,
        u.username,
        u.display_name as "displayName",
        u.profile_picture as "profilePicture",
        COALESCE(fs.status, 'none') as status
      FROM users u
      LEFT JOIN friend_status fs ON u.id = fs.friend_id
      WHERE 
        u.id != ${userId} AND
        (u.username ILIKE ${searchTerm} OR u.display_name ILIKE ${searchTerm})
      LIMIT 20
    `);
    
    console.log(`Found ${users.length} users matching "${query}"`);
    res.json(users);
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a friendship
router.post('/friends', async (req, res) => {
  const userId = req.user.id; // Get user ID from req.user
  const { friendId } = req.body; // Get friend ID from request body

  console.log('Received payload:', req.body); // Log the received payload

  if (!friendId || typeof friendId !== 'number') {
    console.error('Invalid or missing friendId:', req.body); // Log invalid payload
    return res.status(400).json({ error: 'Invalid or missing friendId' });
  }

  try {
    console.log(`Creating friendship between user ${userId} and user ${friendId}`);

    // Check if a friendship already exists
    const existingFriendship = await db.execute(sql`
      SELECT * FROM friends
      WHERE (user_id = ${userId} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${userId})
    `);

    if (existingFriendship.rows.length > 0) {
      console.error('Friendship already exists:', existingFriendship.rows);
      return res.status(409).json({ error: 'Friendship already exists' });
    }

    // Create the friendship
    await db.execute(sql`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES (${userId}, ${friendId}, 'accepted')
    `);

    console.log('Friendship created successfully');
    res.status(201).json({ message: 'Friendship created successfully' });
  } catch (error) {
    console.error('Error creating friendship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

