"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { auth } from "@/lib/api";
import { toast } from "react-hot-toast";
import ImagePicker from "@/components/ui/ImagePicker";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [name, setName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfilePicture(user.profile_picture || null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);

    try {
      await auth.updateProfile(name.trim(), profilePicture);
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for auth state to be initialized
  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-4 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Input
              id="name"
              name="name"
              label="Name"
              type="text"
              description="If left empty, your username will be displayed instead"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Enter your name (optional)"
            />

            <ImagePicker
              value={profilePicture}
              onChange={setProfilePicture}
              label="Profile Picture"
              description="Upload a profile picture (max 5MB). Supported formats: JPEG, PNG, GIF, WebP"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </LayoutContent>
  );
}
