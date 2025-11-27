import { apiClient } from './apiClient';
import { mediaService } from './mediaService';
import { PaginatedResponse, extractArrayFromResponse } from './contentService';

export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: number;
  author_display_name: string;
  category: number;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  is_approved: boolean;
  view_count: number;
  like_count: number;
  author_mood?: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
  comment_count?: number;
}

export interface ForumComment {
  id: number;
  post: number;
  author: number;
  author_display_name: string;
  content: string;
  parent?: number;
  is_anonymous: boolean;
  is_approved: boolean;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  replies?: ForumComment[];
}

export interface ChatRoom {
  id: number;
  name: string;
  description: string;
  topic?: string;
  max_participants: number;
  is_active: boolean;
  is_moderated: boolean;
  created_at: string;
  active_users?: number;
  is_member?: boolean; // Whether current user is already a member
  room_code?: string; // Room code for sharing
}

export interface ChatMessage {
  id: number;
  room: number;
  author: number;
  author_display_name: string;
  content: string;
  message_type: 'text' | 'voice' | 'video' | 'image' | 'file';
  media_url?: string;
  media_filename?: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
  is_anonymous: boolean;
  is_system_message: boolean;
  created_at: string;
  file?: ChatFile; // Optional file attachment
}

export interface ChatFile {
  id: number;
  room: number;
  uploader: number;
  file_url: string;
  original_name: string;
  file_size: number;
  file_type: string;
  is_image: boolean;
  uploaded_at: string;
}

export interface FileUploadResponse {
  id: number;
  url: string;
  name: string;
  size: number;
  type: string;
  is_image: boolean;
  message_id?: number;
}

export interface ChatCall {
  id: number;
  room: number;
  initiator: number;
  call_type: 'audio' | 'video';
  status: 'starting' | 'active' | 'ended';
  started_at: string;
  ended_at?: string;
  participants: number[];
}

export interface CallParticipant {
  user_id: number;
  username: string;
  display_name: string;
  is_muted: boolean;
  is_video_off: boolean;
  joined_at: string;
}

export interface PeerSupportMatch {
  id: number;
  requester: number;
  supporter?: number;
  preferred_topics: string[];
  preferred_age_range?: string;
  preferred_gender?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'pending_approval' | 'rejected';
  matched_at?: string;
  completed_at?: string;
  created_at: string;
  reason?: string;
  description?: string;
  urgency_level?: 'low' | 'medium' | 'high' | 'urgent';
  contact_preference?: 'chat' | 'video' | 'phone' | 'email';
  availability?: string;
  previous_support?: boolean;
  requester_name?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  admin_message?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: number | null;
  is_anonymous?: boolean;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_approved?: boolean;
  author_mood?: string;
}

export interface CreateCommentData {
  post: number;
  content: string;
  parent?: number;
  is_anonymous?: boolean;
}

export interface ModerationReport {
  id: number;
  reporter: number;
  reporter_name: string;
  report_type: 'inappropriate_content' | 'harassment' | 'spam' | 'misinformation' | 'violence' | 'other';
  description: string;
  reported_post?: number;
  reported_comment?: number;
  reported_user?: number;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  moderator?: number;
  moderator_name?: string;
  moderator_notes: string;
  action_taken: string;
  created_at: string;
  resolved_at?: string;
}

export interface CreateReportData {
  report_type: 'inappropriate_content' | 'harassment' | 'spam' | 'misinformation' | 'violence' | 'other';
  description: string;
  reported_post?: number;
  reported_comment?: number;
  reported_user?: number;
}

class CommunityService {
  // Forum Categories
  async getForumCategories(): Promise<ForumCategory[]> {
    try {
      const response = await apiClient.get<ForumCategory[] | PaginatedResponse<ForumCategory>>('/community/categories/');
      return extractArrayFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch forum categories:', error);
      return [];
    }
  }

  async createForumCategory(data: Partial<ForumCategory>): Promise<ForumCategory> {
    return apiClient.post<ForumCategory>('/community/admin/categories/', data);
  }

  async updateForumCategory(id: number, data: Partial<ForumCategory>): Promise<ForumCategory> {
    return apiClient.patch<ForumCategory>(`/community/admin/categories/${id}/`, data);
  }

  async deleteForumCategory(id: number): Promise<void> {
    return apiClient.delete<void>(`/community/admin/categories/${id}/`);
  }

  async activateForumCategory(id: number): Promise<ForumCategory> {
    return apiClient.patch<ForumCategory>(`/community/admin/categories/${id}/`, { is_active: true });
  }

  async deactivateForumCategory(id: number): Promise<ForumCategory> {
    return apiClient.patch<ForumCategory>(`/community/admin/categories/${id}/`, { is_active: false });
  }

  // Forum Posts
  async getForumPosts(categoryId?: number): Promise<ForumPost[]> {
    try {
      const endpoint = categoryId 
        ? `/community/posts/?category=${categoryId}` 
        : '/community/posts/';
      const response = await apiClient.get<ForumPost[] | PaginatedResponse<ForumPost>>(endpoint);
      return extractArrayFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch forum posts:', error);
      return [];
    }
  }

  async getForumPost(id: number): Promise<ForumPost> {
    return apiClient.get<ForumPost>(`/community/posts/${id}/`);
  }

  async createForumPost(data: CreatePostData): Promise<ForumPost> {
    return apiClient.post<ForumPost>('/community/posts/', data);
  }

  async updateForumPost(id: number, data: Partial<CreatePostData>): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, data);
  }

  async deleteForumPost(id: number): Promise<void> {
    return apiClient.delete<void>(`/community/admin/posts/${id}/`);
  }

  async likeForumPost(id: number): Promise<{liked: boolean, message: string}> {
    return apiClient.post<{liked: boolean, message: string}>(`/community/posts/${id}/like/`);
  }

  async pinForumPost(id: number): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, { is_pinned: true });
  }

  async unpinForumPost(id: number): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, { is_pinned: false });
  }

  async lockForumPost(id: number): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, { is_locked: true });
  }

  async unlockForumPost(id: number): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, { is_locked: false });
  }

  async approveForumPost(id: number): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, { is_approved: true });
  }

  async unapproveForumPost(id: number): Promise<ForumPost> {
    return apiClient.patch<ForumPost>(`/community/admin/posts/${id}/`, { is_approved: false });
  }

  // Forum Comments
  async getComments(postId?: number, parentId?: number): Promise<ForumComment[]> {
    try {
      const params = new URLSearchParams();
      if (postId) params.append('post', postId.toString());
      if (parentId) params.append('parent', parentId.toString());
      
      const url = `/community/comments${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await apiClient.get<ForumComment[] | PaginatedResponse<ForumComment>>(url);
      
      // Handle both direct array and paginated response
      const comments = extractArrayFromResponse(response);
      
      return comments;
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      return [];
    }
  }

  async createComment(data: CreateCommentData): Promise<ForumComment> {
    return apiClient.post<ForumComment>('/community/comments/', data);
  }

  async replyToComment(commentId: number, data: { content: string; is_anonymous?: boolean }): Promise<{
    message: string;
    reply: ForumComment;
  }> {
    return apiClient.post(`/community/comments/${commentId}/reply/`, data);
  }

  async updateComment(id: number, data: Partial<CreateCommentData>): Promise<ForumComment> {
    return apiClient.patch<ForumComment>(`/community/comments/${id}/`, data);
  }

  async deleteComment(id: number): Promise<void> {
    return apiClient.delete<void>(`/community/comments/${id}/`);
  }

  async likeComment(id: number): Promise<{ liked: boolean; message: string }> {
    return apiClient.post(`/community/comments/${id}/like/`);
  }

  async likePost(id: number): Promise<{ liked: boolean; message: string }> {
    return apiClient.post(`/community/posts/${id}/like/`);
  }

  // Enhanced Chat Rooms CRUD (3 users max)
  async getChatRooms(params?: { my_rooms?: string; available?: string; type?: string }): Promise<ChatRoom[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.my_rooms) queryParams.append('my_rooms', params.my_rooms);
      if (params?.available) queryParams.append('available', params.available);
      if (params?.type) queryParams.append('type', params.type);
      
      const url = `/community/chat-rooms${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await apiClient.get<ChatRoom[] | PaginatedResponse<ChatRoom>>(url);
      
      // Handle both direct array and paginated response
      const rooms = extractArrayFromResponse(response);
      
      return rooms;
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      return [];
    }
  }

  async getChatRoom(id: number): Promise<ChatRoom> {
    return apiClient.get<ChatRoom>(`/community/chat-rooms/${id}/`);
  }

  async createChatRoom(data: {
    name: string;
    description: string;
    topic?: string;
    room_type: string;
    is_private?: boolean;
  }): Promise<ChatRoom> {
    return apiClient.post<ChatRoom>('/community/chat-rooms/', data);
  }

  async updateChatRoom(id: number, data: Partial<ChatRoom>): Promise<ChatRoom> {
    return apiClient.patch<ChatRoom>(`/community/chat-rooms/${id}/`, data);
  }

  async deleteChatRoom(id: number): Promise<void> {
    return apiClient.delete<void>(`/community/chat-rooms/${id}/`);
  }

  async joinChatRoom(roomId: number): Promise<{ message: string; room_name: string; participant_count: number; room_code: string }> {
    try {
      return await apiClient.post<{ message: string; room_name: string; participant_count: number; room_code: string }>(`/community/chat-rooms/${roomId}/join/`);
    } catch (error: any) {
      // Check if it's a 200 response with already_member flag (backend now returns 200 for existing members)
      if (error.response?.status === 200 && error.response?.data?.already_member) {
        return error.response.data;
      }
      
      // If user is already a member but got 400, handle gracefully
      const errorMessage = error.message || error.response?.data?.detail || error.response?.data?.error || '';
      
      // Log error for debugging
      console.log('Join room error:', errorMessage);
      
      if (errorMessage.includes('You are already in this chat room') || 
          errorMessage.includes('already in this chat room') ||
          errorMessage.includes('Welcome back') ||
          errorMessage.toLowerCase().includes('already')) {
        return {
          message: 'Welcome back! You are already in this room',
          room_name: error.response?.data?.room_name || 'Chat Room',
          participant_count: error.response?.data?.participant_count || 0,
          room_code: error.response?.data?.room_code || ''
        };
      }
      
      // For room full errors, provide better message
      if (errorMessage.includes('full')) {
        const participantInfo = error.response?.data?.participant_count && error.response?.data?.max_participants 
          ? `(${error.response.data.participant_count}/${error.response.data.max_participants} participants)`
          : '';
        throw new Error(`Chat room is full ${participantInfo}`);
      }
      
      throw error;
    }
  }

  async leaveChatRoom(roomId: number): Promise<{ message: string; participant_count: number }> {
    return apiClient.post(`/community/chat-rooms/${roomId}/leave/`);
  }

  async joinChatRoomByCode(roomCode: string): Promise<{ message: string; room_id: number; room_name: string; participant_count: number }> {
    return apiClient.post('/community/chat-rooms/join-by-code/', { room_code: roomCode });
  }

  async getChatRoomParticipants(roomId: number): Promise<{
    room_name: string;
    room_code: string;
    participant_count: number;
    max_participants: number;
    participants: Array<{
      id: number;
      username: string;
      display_name: string;
      joined_at: string;
      last_seen: string;
      is_creator: boolean;
    }>;
  }> {
    return apiClient.get(`/community/chat-rooms/${roomId}/participants/`);
  }

  async getChatRoomStats(): Promise<{
    user_rooms: number;
    created_rooms: number;
    total_messages: number;
    available_rooms: number;
    max_participants_per_room: number;
  }> {
    return apiClient.get('/community/chat-rooms/stats/');
  }

  async getChatMessages(roomId: number): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get<ChatMessage[] | PaginatedResponse<ChatMessage>>(`/community/chat-messages/?room_id=${roomId}`);
      
      // Handle both direct array and paginated response
      const messages = extractArrayFromResponse(response);
      
      return messages;
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
      return [];
    }
  }

  async sendChatMessage(roomId: number, content: string, isAnonymous: boolean = true): Promise<ChatMessage> {
    try {
      // First, verify the room exists and user has access
      try {
        const roomCheck = await this.getChatRoom(roomId);
        console.log('✅ Room verification successful:', roomCheck.name);
      } catch (roomError) {
        console.error('❌ Room verification failed:', roomError);
        throw new Error('Cannot access chat room. Please ensure you have joined the room.');
      }

      const messageData = {
        room: roomId,  // Backend expects 'room', not 'room_id'
        content: content.trim(),
        is_anonymous: isAnonymous,
      };
      
      console.log('📤 Sending message:', messageData);
      
      const response = await apiClient.post<ChatMessage>('/community/chat-messages/', messageData);
      
      console.log('✅ Message sent successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to send message:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        roomId,
        content: content.trim(),
        isAnonymous
      });
      throw error;
    }
  }

  async sendMediaMessage(roomId: number, formData: FormData): Promise<ChatMessage> {
    try {
      console.log('📤 Sending media message via API...');
      
      const response = await apiClient.post<ChatMessage>(`/community/chat/${roomId}/send-message/`, formData);
      
      console.log('✅ Media message sent successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to send media message:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // File Upload
  async uploadChatFile(roomId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('room', roomId.toString());
    
    return apiClient.post<FileUploadResponse>('/community/chat-messages/upload/', formData);
  }

  // Media Upload for Chat
  async uploadMediaFile(formData: FormData): Promise<FileUploadResponse> {
    try {
      console.log('📤 Uploading media file...');
      
      const response = await apiClient.post<FileUploadResponse>('/community/chat/upload-media/', formData);
      
      console.log('✅ Media file uploaded successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to upload media file:', error);
      throw error;
    }
  }

  // Call Management
  async startCall(roomId: number, type: 'audio' | 'video'): Promise<any> {
    try {
      // Test media devices before starting call
      const deviceInfo = await mediaService.testMediaDevices();
      
      if (type === 'video' && !deviceInfo.hasVideo) {
        throw new Error('No camera found. Please connect a camera and try again.');
      }
      
      if (!deviceInfo.hasAudio) {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
      
      if (deviceInfo.permissions.camera === 'denied' && type === 'video') {
        throw new Error('Camera access denied. Please allow camera permissions and try again.');
      }
      
      if (deviceInfo.permissions.microphone === 'denied') {
        throw new Error('Microphone access denied. Please allow microphone permissions and try again.');
      }

      // Start the media service call
      const callSession = await mediaService.startCall(roomId, type);
      
      // Also try to notify the backend
      try {
        const response = await apiClient.post(`/community/chat-rooms/${roomId}/call/start/`, {
          type
        });
        return response;
      } catch (backendError: any) {
        // For demo purposes, return mock data if endpoint doesn't exist
        if (backendError.response?.status === 404) {
          return {
            call_id: Math.floor(Math.random() * 1000),
            room_id: roomId,
            type,
            status: 'active',
            participants: ['You'],
            started_at: new Date().toISOString(),
            initiator: 'You'
          };
        }
        // If backend fails but media service succeeded, continue with mock data
        console.warn('Backend call start failed, using local session:', backendError);
        return callSession;
      }
    } catch (error: any) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }

  async endCall(roomId: number): Promise<void> {
    try {
      // End the media service call first (this cleans up local resources)
      await mediaService.endCall(roomId);
      
      // Then notify the backend
      try {
        await apiClient.post(`/community/chat-rooms/${roomId}/call/end/`);
      } catch (backendError: any) {
        // For demo purposes, ignore 404 errors
        if (backendError.response?.status !== 404) {
          console.warn('Backend call end failed:', backendError);
        }
      }
    } catch (error: any) {
      console.error('Failed to end call:', error);
      throw error;
    }
  }

  async getCallStatus(roomId: number): Promise<{
    has_active_call: boolean;
    call_id?: number;
    type?: string;
    status?: string;
    participants?: string[];
    started_at?: string;
    initiator?: string;
  }> {
    try {
      return await apiClient.get(`/community/chat-rooms/${roomId}/call/status/`);
    } catch (error: any) {
      // Return mock data if backend is not available
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
        return {
          has_active_call: true,
          call_id: Math.floor(Math.random() * 1000),
          type: 'video',
          status: 'active',
          participants: ['You', 'Other Participant'],
          started_at: new Date().toISOString(),
          initiator: 'Other Participant'
        };
      }
      throw error;
    }
  }

  async joinCall(roomId: number): Promise<any> {
    try {
      // First get call status to determine type
      const callStatus = await this.getCallStatus(roomId);
      
      if (!callStatus.has_active_call) {
        throw new Error('No active call to join');
      }
      
      const callType = callStatus.type || 'video';
      
      // Test media devices before joining
      const deviceInfo = await mediaService.testMediaDevices();
      
      if (callType === 'video' && !deviceInfo.hasVideo) {
        throw new Error('No camera found. Please connect a camera and try again.');
      }
      
      if (!deviceInfo.hasAudio) {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
      
      if (deviceInfo.permissions.camera === 'denied' && callType === 'video') {
        throw new Error('Camera access denied. Please allow camera permissions and try again.');
      }
      
      if (deviceInfo.permissions.microphone === 'denied') {
        throw new Error('Microphone access denied. Please allow microphone permissions and try again.');
      }

      // Join the media service call
      const callSession = await mediaService.joinCall(roomId);
      
      // Also try to notify the backend
      try {
        const response = await apiClient.post(`/community/chat-rooms/${roomId}/call/join/`);
        return response;
      } catch (backendError: any) {
        // For demo purposes, return mock data if endpoint doesn't exist
        if (backendError.response?.status === 404) {
          return {
            call_id: Math.floor(Math.random() * 1000),
            room_id: roomId,
            type: callType,
            status: 'active',
            participants: ['You', 'Other User'],
            started_at: new Date().toISOString(),
            initiator: 'Other User'
          };
        }
        // If backend fails but media service succeeded, continue with mock data
        console.warn('Backend call join failed, using local session:', backendError);
        return callSession;
      }
    } catch (error: any) {
      console.error('Failed to join call:', error);
      throw error;
    }
  }

  async leaveCall(roomId: number): Promise<void> {
    try {
      // Leave the media service call first (this cleans up local resources)
      await mediaService.leaveCall(roomId);
      
      // Then notify the backend
      try {
        await apiClient.post(`/community/chat-rooms/${roomId}/call/leave/`);
      } catch (backendError: any) {
        // For demo purposes, ignore 404 errors
        if (backendError.response?.status !== 404) {
          console.warn('Backend call leave failed:', backendError);
        }
      }
    } catch (error: any) {
      console.error('Failed to leave call:', error);
      throw error;
    }
  }

  // Peer Support Methods
  async getPeerSupportMatches(): Promise<PeerSupportMatch[]> {
    try {
      const response = await apiClient.get<PeerSupportMatch[] | PaginatedResponse<PeerSupportMatch>>('/community/peer-support/matches/');
      return extractArrayFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch peer support matches:', error);
      return [];
    }
  }

  async createPeerSupportRequest(data: {
    reason?: string;
    description?: string;
    preferred_topics: string[];
    preferred_age_range?: string;
    preferred_gender?: string;
    urgency_level?: 'low' | 'medium' | 'high' | 'urgent';
    contact_preference?: 'chat' | 'video' | 'phone' | 'email';
    availability?: string;
    previous_support?: boolean;
  }): Promise<PeerSupportMatch> {
    return apiClient.post<PeerSupportMatch>('/community/peer-support/requests/', data);
  }

  async updatePeerSupportMatch(id: number, data: Partial<PeerSupportMatch>): Promise<PeerSupportMatch> {
    return apiClient.patch<PeerSupportMatch>(`/community/peer-support/matches/${id}/`, data);
  }

  async deletePeerSupportMatch(id: number): Promise<void> {
    return apiClient.delete<void>(`/community/peer-support/matches/${id}/`);
  }

  // Admin/Guide Peer Support Management
  async getAllPeerSupportRequests(): Promise<PeerSupportMatch[]> {
    try {
      // Try the admin endpoint first for comprehensive view
      console.log('🔍 Fetching peer support requests from admin API...');
      const response = await apiClient.get<PeerSupportMatch[] | PaginatedResponse<PeerSupportMatch>>('/community/admin/peer-support/');
      console.log('✅ Successfully fetched peer support requests from admin endpoint:', response);
      return extractArrayFromResponse(response);
    } catch (error: any) {
      console.log('ℹ️ Admin endpoint failed, falling back to regular endpoint...');
      
      // Fallback to regular endpoint
      const fallbackResponse = await apiClient.get<PeerSupportMatch[] | PaginatedResponse<PeerSupportMatch>>('/community/peer-support/matches/');
      console.log('✅ Successfully fetched peer support requests from fallback endpoint:', fallbackResponse);
      return extractArrayFromResponse(fallbackResponse);
    }
  }

  async approvePeerSupportRequest(id: number, data?: { admin_message?: string }): Promise<PeerSupportMatch> {
    try {
      // Use the real API endpoint with action parameter
      const requestData = {
        action: 'approve',
        message: data?.admin_message || ''
      };
      return await apiClient.patch<PeerSupportMatch>(`/community/peer-support/matching/${id}/`, requestData);
    } catch (error: any) {
      console.error('❌ Failed to approve peer support request:', error);
      throw error;
    }
  }

  async rejectPeerSupportRequest(id: number, data: { rejection_reason: string; admin_message?: string }): Promise<PeerSupportMatch> {
    try {
      // Use the real API endpoint with action parameter
      const requestData = {
        action: 'reject',
        reason: data.rejection_reason,
        message: data.admin_message || ''
      };
      return await apiClient.patch<PeerSupportMatch>(`/community/peer-support/matching/${id}/`, requestData);
    } catch (error: any) {
      console.error('❌ Failed to reject peer support request:', error);
      throw error;
    }
  }

  async matchPeerSupportUsers(requestId: number, supporterId: number, data?: { admin_message?: string }): Promise<PeerSupportMatch> {
    try {
      // For now, this would require updating the backend to support admin-initiated matching
      // The current backend only supports user self-acceptance
      const requestData = {
        action: 'accept',
        message: data?.admin_message || ''
      };
      return await apiClient.patch<PeerSupportMatch>(`/community/peer-support/matching/${requestId}/`, requestData);
    } catch (error: any) {
      console.error('❌ Failed to match peer support users:', error);
      throw new Error('Admin-initiated matching requires backend enhancement. Currently users must self-accept matches.');
    }
  }

  async getAvailableSupporters(requestId: number): Promise<Array<{
    id: number;
    username: string;
    display_name: string;
    age_range?: string;
    gender?: string;
    available_topics: string[];
    experience_level?: string;
    availability?: string;
  }>> {
    try {
      // Try to get users who are available for peer support
      // This would need a dedicated endpoint in the backend
      const response = await apiClient.get<Array<{
        id: number;
        username: string;
        display_name: string;
        age_range?: string;
        gender?: string;
        available_topics: string[];
        experience_level?: string;
        availability?: string;
      }>>('/accounts/users/supporters/');
      return response;
    } catch (error: any) {
      console.log('ℹ️ Available supporters endpoint not implemented, using fallback approach...');
      
      // Fallback: Since we don't have detailed user info in matches, skip this approach
      console.log('ℹ️ Fallback approach would require additional user endpoint, using mock data...');
      
      // Final fallback: mock data
      const mockSupporters = [
        {
          id: 1,
          username: 'supporter1',
          display_name: 'Sarah Johnson',
          age_range: '25-35',
          gender: 'female',
          available_topics: ['anxiety', 'depression', 'stress'],
          experience_level: 'Experienced',
          availability: 'Weekday evenings, Weekend mornings'
        },
        {
          id: 2,
          username: 'supporter2',
          display_name: 'Mike Chen',
          age_range: '20-30',
          gender: 'male',
          available_topics: ['academic', 'relationships', 'stress'],
          experience_level: 'Peer',
          availability: 'Flexible schedule'
        }
      ];
      console.log('✅ Using mock supporters data:', mockSupporters);
      return mockSupporters;
    }
  }

  // Community Statistics
  async getCommunityStats(): Promise<{
    total_posts: number;
    total_comments: number;
    active_chat_rooms: number;
    user_posts: number;
    total_categories?: number;
    total_users_active?: number;
    posts_this_week?: number;
    pending_reports?: number;
    total_reports?: number;
    active_peer_matches?: number;
  }> {
    try {
      return await apiClient.get('/community/stats/');
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
      // Return empty stats if API fails
      return {
        total_posts: 0,
        total_comments: 0,
        active_chat_rooms: 0,
        user_posts: 0,
        total_categories: 0,
        total_users_active: 0,
        posts_this_week: 0
      };
    }
  }

  // User Information
  async getCurrentUser(): Promise<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
  }> {
    return apiClient.get('/accounts/profile/');
  }

  // Moderation Reports
  async getModerationReports(): Promise<ModerationReport[]> {
    try {
      const response = await apiClient.get<ModerationReport[] | PaginatedResponse<ModerationReport>>('/community/reports/');
      return extractArrayFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch moderation reports:', error);
      return [];
    }
  }

  async createModerationReport(data: CreateReportData): Promise<ModerationReport> {
    return apiClient.post<ModerationReport>('/community/reports/', data);
  }

  async resolveModerationReport(reportId: number, data: { moderator_notes?: string }): Promise<{ message: string }> {
    return apiClient.post(`/community/admin/reports/${reportId}/`, {
      action: 'resolve',
      moderator_notes: data.moderator_notes || ''
    });
  }

  async dismissModerationReport(reportId: number, data: { moderator_notes?: string }): Promise<{ message: string }> {
    return apiClient.post(`/community/admin/reports/${reportId}/`, {
      action: 'dismiss',
      moderator_notes: data.moderator_notes || ''
    });
  }

}

export const communityService = new CommunityService();
export default communityService;
