export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  displayName?: string;
  profilePictureUrl?: string;
  status: string;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  displayName?: string;
}