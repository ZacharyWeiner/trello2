import { Metadata } from 'next';
import { StoryModeDemo } from '@/components/demo/StoryModeDemo';

export const metadata: Metadata = {
  title: 'Story Mode - Epic Project Narratives | Trello Clone',
  description: 'Transform your project management into an epic narrative adventure with animated storytelling, character development, and cinematic GIF sequences.',
  keywords: ['story mode', 'project narrative', 'animated storytelling', 'productivity', 'project management'],
};

export default function StoryModePage() {
  return <StoryModeDemo />;
} 