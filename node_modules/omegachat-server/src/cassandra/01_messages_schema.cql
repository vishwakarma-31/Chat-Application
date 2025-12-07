-- Create keyspace for OmegaChat
CREATE KEYSPACE IF NOT EXISTS omegachat
  WITH REPLICATION = {
    'class' : 'SimpleStrategy',
    'replication_factor' : 1
  };

USE omegachat;

-- Create table for storing messages
-- Partition by conversation_id for efficient retrieval of conversation histories
-- Cluster by timestamp descending for easy retrieval of latest messages
CREATE TABLE messages (
  conversation_id UUID,
  message_id TIMEUUID,
  sender_id INT,
  recipient_id INT,
  content TEXT,
  media_urls LIST<TEXT>,
  message_type VARCHAR(20), -- text, image, video, document, etc.
  status VARCHAR(20), -- sent, delivered, read
  timestamp TIMESTAMP,
  edited BOOLEAN DEFAULT false,
  edited_timestamp TIMESTAMP,
  deleted BOOLEAN DEFAULT false,
  metadata MAP<TEXT, TEXT>,
  PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- Create indexes for efficient querying
CREATE INDEX ON messages (sender_id);
CREATE INDEX ON messages (recipient_id);
CREATE INDEX ON messages (timestamp);
CREATE INDEX ON messages (status);

-- Create table for storing conversation metadata
CREATE TABLE conversations (
  conversation_id UUID PRIMARY KEY,
  participants SET<INT>,
  conversation_type VARCHAR(10), -- private, group
  name VARCHAR(100), -- for group chats
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create table for storing user-specific conversation settings
CREATE TABLE user_conversations (
  user_id INT,
  conversation_id UUID,
  unread_count INT DEFAULT 0,
  last_read_message_id TIMEUUID,
  muted BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, conversation_id)
);