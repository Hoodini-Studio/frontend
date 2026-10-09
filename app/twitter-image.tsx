import {
  socialCardAlt,
  socialCardContentType,
  socialCardImage,
  socialCardSize,
} from "@/components/seo/social-card";

export const alt = socialCardAlt;
export const size = socialCardSize;
export const contentType = socialCardContentType;

export default function TwitterImage() {
  return socialCardImage();
}
