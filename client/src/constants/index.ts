// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SERVER_URL = 'http://localhost:8000';

// Pagination Constants
export const MESSAGE_LIMIT = 50;
export const CONVERSATION_LIMIT = 20;

// Storage Keys
export const AUTH_TOKEN_KEY = 'authToken';

// Status Constants
export const ONLINE_STATUS = 'online';
export const OFFLINE_STATUS = 'offline';
export const AWAY_STATUS = 'away';

export const SENT_STATUS = 'sent';
export const DELIVERED_STATUS = 'delivered';
export const READ_STATUS = 'read';

// Message Types
export const TEXT_MESSAGE = 'text';
export const IMAGE_MESSAGE = 'image';
export const VIDEO_MESSAGE = 'video';
export const DOCUMENT_MESSAGE = 'document';
export const AUDIO_MESSAGE = 'audio';

// HTTP Methods
export const HTTP_GET = 'GET';
export const HTTP_POST = 'POST';
export const HTTP_PUT = 'PUT';
export const HTTP_PATCH = 'PATCH';
export const HTTP_DELETE = 'DELETE';

// Socket Events
export const SOCKET_CONNECT = 'connect';
export const SOCKET_DISCONNECT = 'disconnect';
export const SOCKET_CONNECT_ERROR = 'connect_error';
export const SOCKET_JOIN_ROOM = 'join_room';
export const SOCKET_LEAVE_ROOM = 'leave_room';
export const SOCKET_SEND_MESSAGE = 'send_message';
export const SOCKET_RECEIVE_MESSAGE = 'receive_message';
export const SOCKET_TYPING = 'typing';
export const SOCKET_USER_TYPING = 'user_typing';
export const SOCKET_USER_JOINED = 'user_joined';
export const SOCKET_USER_LEFT = 'user_left';