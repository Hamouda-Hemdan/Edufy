// utils/profile.ts
interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt?: string;
}

export const getProfile = async (): Promise<ProfileData> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch("/api/profile", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch profile");
  }

  return await response.json();
};