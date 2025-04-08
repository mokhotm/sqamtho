import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Smile, Gift } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SouthAfricanAccent } from "./ui/south-african-pattern";

interface Author {
  id: number;
  username: string;
  displayName: string;
  profilePicture: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}

interface PostProps {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  reactions: {
    count: number;
    types: Record<string, number>;
  };
}

export default function PostCard({ id, content, imageUrl, createdAt, author, comments, reactions }: PostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  // Calculate if the post is liked by the current user
  const hasLiked = false; // This should be determined from the backend

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${id}/comments`, { content });
      return await res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: "There was an error adding your comment",
        variant: "destructive",
      });
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        await apiRequest("DELETE", `/api/posts/${id}/reactions`);
      } else {
        await apiRequest("POST", `/api/posts/${id}/reactions`, { type: "like" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update reaction",
        description: "There was an error updating your reaction",
        variant: "destructive",
      });
    }
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleLike = () => {
    toggleLikeMutation.mutate();
  };

  const formattedDate = () => {
    const date = new Date(createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <div className="post-card relative bg-white mb-6">
      <SouthAfricanAccent className="absolute inset-0" />
      <div className="p-5 relative z-10">
        {/* Post Header */}
        <div className="flex items-start">
          <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={author.profilePicture} alt={author.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              {author.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="font-semibold text-gray-900">{author.displayName}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{formattedDate()}</span>
              <span className="mx-1.5 w-1 h-1 bg-gray-300 rounded-full inline-block"></span>
              <span className="flex items-center text-primary/60">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Public</span>
              </span>
            </div>
          </div>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mt-4 text-gray-800 leading-relaxed">
          <p>{content}</p>
        </div>

        {/* Post Image */}
        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <img src={imageUrl} alt="Post" className="w-full h-auto transform hover:scale-[1.01] transition-transform duration-300" />
          </div>
        )}

        {/* Reactions Summary */}
        {reactions.count > 0 && (
          <div className="mt-4 flex items-center">
            <div className="flex -space-x-1">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                <ThumbsUp className="h-3 w-3" />
              </div>
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                <Heart className="h-3 w-3" />
              </div>
              <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">
                <Smile className="h-3 w-3" />
              </div>
            </div>
            <span className="ml-2 text-sm text-gray-500">{reactions.count}</span>
            {comments.length > 0 && (
              <span className="ml-auto text-sm text-gray-500">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-4 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center justify-center rounded-lg ${
              hasLiked ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
            } transition-colors duration-200`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 mr-1.5 ${hasLiked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center rounded-lg text-gray-600 hover:bg-secondary/5 hover:text-secondary transition-colors duration-200"
          >
            <MessageCircle className="h-5 w-5 mr-1.5" />
            <span>Comment</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center rounded-lg text-gray-600 hover:bg-accent/5 hover:text-accent transition-colors duration-200"
          >
            <Share2 className="h-5 w-5 mr-1.5" />
            <span>Share</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Gift className="h-5 w-5 mr-1.5" />
            <span>Gift</span>
          </Button>
        </div>
        
        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex items-start mb-4 group">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.author.profilePicture} alt={comment.author.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-primary/70 text-white">
                    {comment.author.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 flex-1">
                  <div className="bg-gray-50 rounded-2xl px-4 py-2.5 relative chat-bubble-received">
                    <p className="font-medium text-sm text-gray-900">{comment.author.displayName}</p>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="text-xs text-gray-500 hover:text-primary">Like</button>
                    <span className="mx-1 text-gray-300">•</span>
                    <button className="text-xs text-gray-500 hover:text-primary">Reply</button>
                    <span className="mx-1 text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length > 2 && (
              <button 
                className="text-sm font-medium text-primary hover:text-primary/80 mb-4 transition-colors duration-200"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? "Show fewer comments" : `View all ${comments.length} comments`}
              </button>
            )}
            
            <form onSubmit={handleAddComment} className="flex items-center mt-2">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm pr-16 transition-all duration-200"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button type="button" className="text-gray-400 hover:text-primary p-1 rounded-full">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="ml-2 text-primary hover:bg-primary/5"
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </form>
          </div>
        )}
        
        {/* Empty comments section - just the form */}
        {comments.length === 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <form onSubmit={handleAddComment} className="flex items-center">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm pr-16 transition-all duration-200"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button type="button" className="text-gray-400 hover:text-primary p-1 rounded-full">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="ml-2 text-primary hover:bg-primary/5"
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
