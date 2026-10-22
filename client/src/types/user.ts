export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  skills: string[];
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileBody {
  name?: string;
  bio?: string;
  skills?: string[];
  profileUrl?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    name: string;
    bio: string;
    skills: string[];
    profilePicture: string;
  };
}

export interface SearchUserResult {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
}
