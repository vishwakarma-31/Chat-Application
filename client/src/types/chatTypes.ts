// TypeScript interfaces based on the XML schema

export type UUID = string;

export interface ChatApplication {
  schemaVersion: string;
  generatedAt: Date;
  requestId?: UUID;
  userInterface?: UserInterface;
  dataPayload?: DataPayload;
  authentication?: Authentication;
  systemErrors?: SystemErrors;
}

export interface UserInterface {
  theme?: ThemeConfig;
  mainLayout: MainLayout;
}

export interface ThemeConfig {
  mode?: ThemeMode;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export type ThemeMode = 'Light' | 'Dark' | 'HighContrast' | 'System';

export interface MainLayout {
  orientation?: Orientation;
  sidebar: SidebarContainer;
  chatArea: ChatAreaContainer;
}

export type Orientation = 'Horizontal' | 'Vertical';

export interface SidebarContainer {
  width?: Dimension;
  isVisible?: boolean;
  searchBar: InputComponent;
  userList: UserListLayout;
}

export type Dimension = string; // Can be "match_parent" | "wrap_content" | "auto" | "fill" | "{number}px|dp|sp|%|rem|em"

export interface ChatAreaContainer {
  header: HeaderComponent;
  messageList: MessageListLayout;
  inputPanel: InputPanelLayout;
}

export interface UserListLayout {
  items: UserListItem[];
}

export interface UserListItem {
  userId: UUID;
  templateId?: string;
}

export interface MessageListLayout {
  backgroundColor?: string;
  backgroundImageUrl?: string;
  groupConsecutiveMessages?: boolean;
}

export interface InputPanelLayout {
  height?: Dimension;
  textInput: InputComponent;
  sendButton: ButtonComponent;
  attachButton?: ButtonComponent;
  voiceRecordButton?: ButtonComponent;
}

export interface InputComponent {
  placeholder?: string;
  inputType?: InputType;
  maxLength?: number;
}

export type InputType = 'Text' | 'Password' | 'Email' | 'Phone' | 'Number';

export interface ButtonComponent {
  label?: string;
  icon?: string;
  actionId: string;
  isEnabled?: boolean;
}

export interface HeaderComponent {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export interface DataPayload {
  users?: UserCollection;
  conversations?: ConversationCollection;
}

export interface UserCollection {
  items: UserEntity[];
}

export interface UserEntity {
  userId: UUID;
  createdAt: Date;
  profile: UserProfile;
  settings?: UserSettings;
}

export interface UserProfile {
  displayName: string;
  username: string;
  avatarUrl?: string;
  onlineStatus?: PresenceStatus;
  lastSeen?: Date;
  bio?: string;
}

export type PresenceStatus = 'Online' | 'Offline' | 'Away' | 'Busy' | 'Invisible' | 'Typing';

export interface UserSettings {
  notificationsEnabled?: boolean;
  readReceiptsEnabled?: boolean;
}

export interface ConversationCollection {
  items: Conversation[];
}

export interface Conversation {
  conversationId: UUID;
  title?: string;
  isGroup?: boolean;
  participants: ParticipantList;
  messages: MessageCollection;
}

export interface ParticipantList {
  items: Participant[];
}

export interface Participant {
  userId: UUID;
  role?: ParticipantRole;
}

export type ParticipantRole = 'Owner' | 'Admin' | 'Moderator' | 'Member';

export interface MessageCollection {
  items: MessageEntity[];
}

export interface MessageEntity {
  messageId: UUID;
  senderId: UUID;
  timestamp: Date;
  status?: MessageDeliveryStatus;
  isEdited?: boolean;
  body: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
}

export type MessageDeliveryStatus = 'Sending' | 'Sent' | 'Delivered' | 'Read' | 'Failed';

export interface Attachment {
  url: string;
  mimeType: string;
  fileName?: string;
  sizeBytes?: number;
  thumbnailUrl?: string;
}

export interface Reaction {
  userId: UUID;
  emoji: string;
}

export interface Authentication {
  loginRequest?: LoginRequest;
  loginResponse?: LoginResponse;
  logoutRequest?: LogoutRequest;
  refreshSession?: RefreshSession;
}

export interface LoginRequest {
  credentials: Credentials;
  deviceInfo: DeviceInfo;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: AuthStatus;
  session: Session;
  userProfile: UserEntity;
}

export type AuthStatus = 'Success' | 'RequiresMFA' | 'Failure';

export interface Session {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  issuedAt: Date;
}

export interface LogoutRequest {
  token: string;
}

export interface RefreshSession {
  refreshToken: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType?: DeviceType;
  osVersion?: string;
  clientVersion?: string;
}

export type DeviceType = 'Mobile' | 'Tablet' | 'Desktop' | 'Web' | 'IoT';

export interface SystemErrors {
  errors: Error[];
}

export interface Error {
  code: number;
  severity?: ErrorSeverity;
  timestamp: Date;
  resourceKey?: string;
  description: string;
  technicalDetails?: string;
  suggestedAction?: string;
}

export type ErrorSeverity = 'Info' | 'Warning' | 'Error' | 'Critical';