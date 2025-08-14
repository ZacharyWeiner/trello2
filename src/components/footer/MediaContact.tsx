"use client";
import React from 'react';
import { Mail, Phone, Globe, Twitter, Linkedin, FileText } from 'lucide-react';
import { mediaContact, getMediaMailto } from '@/config/media';

export const MediaContactBlock: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const hasAny = mediaContact.email || mediaContact.phone || mediaContact.website || mediaContact.twitter || mediaContact.linkedin || mediaContact.pressKitUrl;
  if (!hasAny) return null;

  const itemClass = compact ? 'text-sm text-gray-600 hover:text-gray-900' : 'text-gray-700 hover:text-gray-900';
  const rowClass = compact ? 'flex items-center gap-2' : 'flex items-center gap-3';

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-900">Media Contact</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {mediaContact.email && (
          <a className={rowClass + ' ' + itemClass} href={getMediaMailto('Press inquiry')}> 
            <Mail className="h-4 w-4" /> {mediaContact.email}
          </a>
        )}
        {mediaContact.phone && (
          <a className={rowClass + ' ' + itemClass} href={`tel:${mediaContact.phone}`}>
            <Phone className="h-4 w-4" /> {mediaContact.phone}
          </a>
        )}
        {mediaContact.website && (
          <a className={rowClass + ' ' + itemClass} href={mediaContact.website} target="_blank" rel="noreferrer">
            <Globe className="h-4 w-4" /> {mediaContact.website}
          </a>
        )}
        {mediaContact.twitter && (
          <a className={rowClass + ' ' + itemClass} href={mediaContact.twitter} target="_blank" rel="noreferrer">
            <Twitter className="h-4 w-4" /> Twitter
          </a>
        )}
        {mediaContact.linkedin && (
          <a className={rowClass + ' ' + itemClass} href={mediaContact.linkedin} target="_blank" rel="noreferrer">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        )}
        {mediaContact.pressKitUrl && (
          <a className={rowClass + ' ' + itemClass} href={mediaContact.pressKitUrl} target="_blank" rel="noreferrer">
            <FileText className="h-4 w-4" /> Press Kit
          </a>
        )}
      </div>
    </div>
  );
};


