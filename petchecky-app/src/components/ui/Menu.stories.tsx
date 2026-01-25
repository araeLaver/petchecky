import type { Meta, StoryObj } from "@storybook/react";
import { Menu } from "./Menu";

const meta: Meta<typeof Menu> = {
  title: "UI/Menu",
  component: Menu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
접근성이 향상된 드롭다운 메뉴 컴포넌트입니다.

## 키보드 네비게이션
- **↑ ↓**: 메뉴 항목 간 이동
- **Enter / Space**: 항목 선택
- **Escape**: 메뉴 닫기
- **Home**: 첫 번째 항목으로 이동
- **End**: 마지막 항목으로 이동
- **문자 입력**: 해당 문자로 시작하는 항목 검색

## 접근성
- \`role="menu"\`와 \`role="menuitem"\` 적용
- \`aria-haspopup\`과 \`aria-expanded\` 연결
- 비활성화된 항목은 \`aria-disabled\` 처리
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 메뉴
export const Default: Story = {
  args: {
    trigger: (
      <button className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200">
        메뉴 열기
      </button>
    ),
    items: [
      { id: "edit", label: "수정" },
      { id: "duplicate", label: "복제" },
      { id: "archive", label: "보관" },
      { id: "divider1", label: "", divider: true },
      { id: "delete", label: "삭제", danger: true },
    ],
    ariaLabel: "작업 메뉴",
  },
};

// 아이콘이 포함된 메뉴
export const WithIcons: Story = {
  args: {
    trigger: (
      <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        작업 선택
      </button>
    ),
    items: [
      {
        id: "edit",
        label: "수정하기",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
      },
      {
        id: "share",
        label: "공유하기",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        ),
      },
      {
        id: "download",
        label: "다운로드",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        ),
      },
      { id: "divider", label: "", divider: true },
      {
        id: "delete",
        label: "삭제하기",
        danger: true,
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
      },
    ],
    ariaLabel: "파일 작업",
  },
  parameters: {
    docs: {
      description: {
        story: "아이콘이 포함된 메뉴 항목입니다.",
      },
    },
  },
};

// 비활성화된 항목 포함
export const WithDisabledItems: Story = {
  args: {
    trigger: (
      <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
        옵션
      </button>
    ),
    items: [
      { id: "option1", label: "옵션 1" },
      { id: "option2", label: "옵션 2 (비활성화)", disabled: true },
      { id: "option3", label: "옵션 3" },
      { id: "option4", label: "옵션 4 (비활성화)", disabled: true },
    ],
    ariaLabel: "옵션 메뉴",
  },
  parameters: {
    docs: {
      description: {
        story: "일부 항목이 비활성화된 메뉴입니다. 비활성화된 항목은 선택할 수 없습니다.",
      },
    },
  },
};

// 프로필 메뉴
export const ProfileMenu: Story = {
  args: {
    trigger: (
      <button className="flex items-center gap-2 rounded-full bg-gray-100 p-1 pr-3 hover:bg-gray-200">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
          김
        </div>
        <span className="text-sm">김철수</span>
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    ),
    items: [
      { id: "profile", label: "내 프로필" },
      { id: "settings", label: "설정" },
      { id: "subscription", label: "구독 관리" },
      { id: "divider", label: "", divider: true },
      { id: "logout", label: "로그아웃", danger: true },
    ],
    placement: "bottom-end",
    ariaLabel: "사용자 메뉴",
  },
  parameters: {
    docs: {
      description: {
        story: "프로필 드롭다운 메뉴 예시입니다.",
      },
    },
  },
};
