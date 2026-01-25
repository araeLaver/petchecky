import type { Meta, StoryObj } from "@storybook/react";
import { Button, IconButton } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "접근성이 개선된 버튼 컴포넌트. 다양한 변형과 크기를 지원합니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
      description: "버튼 스타일 변형",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "버튼 크기",
    },
    loading: {
      control: "boolean",
      description: "로딩 상태 표시",
    },
    fullWidth: {
      control: "boolean",
      description: "전체 너비로 확장",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 버튼
export const Default: Story = {
  args: {
    children: "버튼",
    variant: "primary",
    size: "md",
  },
};

// 모든 변형
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "사용 가능한 모든 버튼 변형입니다.",
      },
    },
  },
};

// 모든 크기
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "사용 가능한 모든 버튼 크기입니다.",
      },
    },
  },
};

// 로딩 상태
export const Loading: Story = {
  args: {
    children: "저장 중...",
    loading: true,
    variant: "primary",
  },
  parameters: {
    docs: {
      description: {
        story: "로딩 상태의 버튼입니다. 스피너가 표시됩니다.",
      },
    },
  },
};

// 비활성화
export const Disabled: Story = {
  args: {
    children: "비활성화됨",
    disabled: true,
    variant: "primary",
  },
};

// 전체 너비
export const FullWidth: Story = {
  args: {
    children: "전체 너비 버튼",
    fullWidth: true,
    variant: "primary",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

// 아이콘 포함
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        추가하기
      </Button>
      <Button
        rightIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        }
      >
        다음
      </Button>
      <Button
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        }
        variant="outline"
      >
        업로드
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "아이콘이 포함된 버튼입니다. 왼쪽 또는 오른쪽에 아이콘을 배치할 수 있습니다.",
      },
    },
  },
};

// 아이콘 버튼
const IconButtonMeta: Meta<typeof IconButton> = {
  title: "UI/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export const IconButtonDefault: StoryObj<typeof IconButton> = {
  render: () => (
    <div className="flex gap-4">
      <IconButton
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
        label="좋아요"
        variant="ghost"
      />
      <IconButton
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        }
        label="공유"
        variant="outline"
      />
      <IconButton
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        label="삭제"
        variant="danger"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "아이콘만 표시되는 버튼입니다. 접근성을 위해 `label` prop이 필수입니다.",
      },
    },
  },
};
