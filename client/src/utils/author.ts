export interface AuthorInfo {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
}

export function getAuthorInfo(
  author: string | { name: string; username: string; profilePicture: string },
  fallbackId?: string,
): AuthorInfo {
  if (typeof author === 'string') {
    return {
      id: fallbackId ?? author,
      name: 'Unknown Developer',
      username: 'unknown',
      profilePicture: '',
    };
  }
  return {
    id: (author as { _id?: string })._id ?? fallbackId ?? '',
    name: author.name || 'Unknown Developer',
    username: author.username || 'unknown',
    profilePicture: author.profilePicture ?? '',
  };
}

export function getCommentUserInfo(
  user: string | { name: string; username: string },
  fallbackId?: string,
): { id: string; name: string; username: string } {
  if (typeof user === 'string') {
    return {
      id: fallbackId ?? user,
      name: 'Unknown Developer',
      username: 'unknown',
    };
  }
  return {
    id: (user as { _id?: string })._id ?? fallbackId ?? '',
    name: user.name || 'Unknown Developer',
    username: user.username || 'unknown',
  };
}
