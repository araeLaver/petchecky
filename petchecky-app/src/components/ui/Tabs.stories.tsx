import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
접근성이 향상된 탭 컴포넌트입니다.

## 키보드 네비게이션
- **← →**: 탭 간 이동
- **Home**: 첫 번째 탭으로 이동
- **End**: 마지막 탭으로 이동

## 접근성
- \`role="tablist"\`, \`role="tab"\`, \`role="tabpanel"\` 적용
- \`aria-selected\`, \`aria-controls\`, \`aria-labelledby\` 연결
- 비활성화된 탭은 \`aria-disabled\` 처리
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    ariaLabel: {
      control: "text",
      description: "탭리스트 접근성 레이블",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 탭
export const Default: Story = {
  args: {
    tabs: [
      {
        id: "info",
        label: "정보",
        content: (
          <div className="p-4">
            <h3 className="font-bold mb-2">정보 탭</h3>
            <p className="text-gray-600">기본 정보가 표시됩니다.</p>
          </div>
        ),
      },
      {
        id: "settings",
        label: "설정",
        content: (
          <div className="p-4">
            <h3 className="font-bold mb-2">설정 탭</h3>
            <p className="text-gray-600">설정 옵션이 표시됩니다.</p>
          </div>
        ),
      },
      {
        id: "history",
        label: "히스토리",
        content: (
          <div className="p-4">
            <h3 className="font-bold mb-2">히스토리 탭</h3>
            <p className="text-gray-600">활동 기록이 표시됩니다.</p>
          </div>
        ),
      },
    ],
    ariaLabel: "설정 탭",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// 비활성화된 탭 포함
export const WithDisabledTab: Story = {
  args: {
    tabs: [
      {
        id: "active1",
        label: "활성 탭 1",
        content: <div className="p-4">활성화된 탭 내용입니다.</div>,
      },
      {
        id: "disabled",
        label: "비활성 탭",
        content: <div className="p-4">이 내용은 표시되지 않습니다.</div>,
        disabled: true,
      },
      {
        id: "active2",
        label: "활성 탭 2",
        content: <div className="p-4">또 다른 활성화된 탭입니다.</div>,
      },
    ],
    ariaLabel: "탭 예시",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "비활성화된 탭이 포함된 예시입니다. 비활성화된 탭은 클릭하거나 키보드로 선택할 수 없습니다.",
      },
    },
  },
};

// 풍부한 콘텐츠
export const RichContent: Story = {
  args: {
    tabs: [
      {
        id: "profile",
        label: "프로필",
        content: (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                🐕
              </div>
              <div>
                <h3 className="font-bold text-lg">멍멍이</h3>
                <p className="text-gray-500">골든 리트리버</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>나이:</strong> 3살</p>
              <p><strong>체중:</strong> 28kg</p>
            </div>
          </div>
        ),
      },
      {
        id: "health",
        label: "건강",
        content: (
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span>예방접종</span>
                <span className="text-green-600 font-medium">완료</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span>건강검진</span>
                <span className="text-yellow-600 font-medium">예정됨</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "activity",
        label: "활동",
        content: (
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              아직 기록된 활동이 없습니다.
            </div>
          </div>
        ),
      },
    ],
    defaultTabId: "profile",
    ariaLabel: "반려동물 정보",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};
