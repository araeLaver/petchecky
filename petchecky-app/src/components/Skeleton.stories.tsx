import type { Meta, StoryObj } from '@storybook/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonPetCard,
  SkeletonChatMessage,
  SkeletonListItem,
  SkeletonPostCard,
  SkeletonStatCard,
  SkeletonPageHeader,
} from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: 'w-full h-8',
  },
};

export const Text: StoryObj<typeof SkeletonText> = {
  render: () => (
    <div className="space-y-2">
      <SkeletonText className="w-full" />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
    </div>
  ),
};

export const Circle: StoryObj<typeof SkeletonCircle> = {
  render: () => (
    <div className="flex gap-4">
      <SkeletonCircle className="w-8 h-8" />
      <SkeletonCircle className="w-12 h-12" />
      <SkeletonCircle className="w-16 h-16" />
    </div>
  ),
};

export const Card: StoryObj<typeof SkeletonCard> = {
  render: () => <SkeletonCard />,
};

export const PetCard: StoryObj<typeof SkeletonPetCard> = {
  render: () => <SkeletonPetCard />,
};

export const ChatMessage: StoryObj<typeof SkeletonChatMessage> = {
  render: () => (
    <div className="space-y-4">
      <SkeletonChatMessage />
      <SkeletonChatMessage isUser />
    </div>
  ),
};

export const ListItem: StoryObj<typeof SkeletonListItem> = {
  render: () => (
    <div className="space-y-2">
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
    </div>
  ),
};

export const PostCard: StoryObj<typeof SkeletonPostCard> = {
  render: () => <SkeletonPostCard />,
};

export const StatCard: StoryObj<typeof SkeletonStatCard> = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>
  ),
};

export const PageHeader: StoryObj<typeof SkeletonPageHeader> = {
  render: () => <SkeletonPageHeader />,
};
