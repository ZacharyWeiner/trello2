export type MediaContact = {
  name?: string;
  email?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  pressKitUrl?: string;
};

export const mediaContact: MediaContact = {
  name: process.env.NEXT_PUBLIC_MEDIA_CONTACT_NAME || 'Media Relations',
  email: process.env.NEXT_PUBLIC_MEDIA_CONTACT_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_MEDIA_CONTACT_PHONE || '',
  twitter: process.env.NEXT_PUBLIC_MEDIA_CONTACT_TWITTER || '',
  linkedin: process.env.NEXT_PUBLIC_MEDIA_CONTACT_LINKEDIN || '',
  website: process.env.NEXT_PUBLIC_MEDIA_CONTACT_WEBSITE || '',
  pressKitUrl: process.env.NEXT_PUBLIC_MEDIA_PRESS_KIT_URL || ''
};

export function getMediaMailto(subject?: string): string | undefined {
  if (!mediaContact.email) return undefined;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  return `mailto:${mediaContact.email}${params.toString() ? `?${params.toString()}` : ''}`;
}


