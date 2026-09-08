export type CommentStatus = 'approved' | 'pending' | 'spam' | 'deleted';

/** A comment as exposed to the public API. Never includes the author's email. */
export interface Comment {
  id: number;
  postSlug: string;
  parentId: number | null;
  depth: number;
  authorName: string;
  /** MD5 of the author's email, for Gravatar. Empty when no email was given. */
  avatarHash: string;
  body: string;
  isAuthor: boolean;
  status: CommentStatus;
  createdAt: string;
}

/** A comment with its replies nested underneath it. */
export interface CommentNode extends Comment {
  replies: CommentNode[];
}

/** A comment as seen in the admin moderation queue - includes the email. */
export interface AdminComment extends Comment {
  authorEmail: string | null;
  ipHash: string;
}

export interface NewCommentInput {
  postSlug: string;
  parentId?: number | null;
  authorName: string;
  authorEmail?: string | null;
  body: string;
  isAuthor?: boolean;
  ipHash: string;
}

/** Replies deeper than this are attached to their parent but rendered flat. */
export const MAX_THREAD_DEPTH = 6;
export const MAX_BODY_LENGTH = 2000;
export const MAX_NAME_LENGTH = 60;
