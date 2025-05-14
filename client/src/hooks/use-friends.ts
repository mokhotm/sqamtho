import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';

interface Friend {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  mutualFriends?: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIENDS),
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      console.log('Fetching friend requests...');
      const response = await api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIEND_REQUESTS);
      console.log('Friend requests fetched:', response);
      return response;
    },
  });
}

export function useFriendSuggestions() {
  return useQuery({
    queryKey: ['friendSuggestions'],
    queryFn: () => api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIEND_SUGGESTIONS),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => api.post(`/api/friend-requests/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] }); // Invalidate requests to show the sent request
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ friendId, accept }: { friendId: number; accept: boolean }) =>
      accept
        ? api.post(`/api/friend-request/${friendId}/accept`)
        : api.delete(`/api/friend-request/${friendId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      console.error('Error responding to friend request:', error); // Add error logging
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery<Friend[]>({
    queryKey: ['searchUsers', query],
    queryFn: () => api.get<Friend[]>(`/api/search?q=${query}`),
    enabled: !!query && query.length > 1, // Only fetch if query is not empty and has at least 2 characters
  });
}
