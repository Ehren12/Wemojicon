import type { User } from "@clerk/nextjs/dist/api";
export const filteredUserForClient = (user: User) => {
    return {
      id: user.id,
      username: user.username,
      profilePicture: user.profileImageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  };