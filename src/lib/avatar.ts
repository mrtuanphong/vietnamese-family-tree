import type { Gender } from "@/types";

export function getAvatarUrl(gender: Gender): string {
  if (gender === "male") return "/avatars/male.svg";
  if (gender === "female") return "/avatars/female.svg";
  return "/avatars/unknown.svg";
}
