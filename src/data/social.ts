export type SocialNetwork = "youtube" | "x" | "linkedin" | "instagram";

export const socialLinks = {
  youtube: "https://www.youtube.com/@GlauciaLemos",
  x: "https://x.com/glaucia_lemos86",
  linkedin: "https://www.linkedin.com/in/glaucialemos",
  instagram: "https://www.instagram.com/glaucia.lemos.dev",
} as const satisfies Record<SocialNetwork, `https://${string}`>;
