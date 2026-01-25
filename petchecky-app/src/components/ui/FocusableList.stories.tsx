import type { Meta, StoryObj } from "@storybook/react";
import { FocusableList } from "./FocusableList";

const meta: Meta<typeof FocusableList> = {
  title: "Accessibility/FocusableList",
  component: FocusableList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
키보드로 탐색 가능한 리스트 컴포넌트입니다.

## 키보드 네비게이션
- **↑ ↓** (vertical) / **← →** (horizontal): 항목 간 이동
- **Home**: 첫 번째 항목으로 이동
- **End**: 마지막 항목으로 이동
- **Enter / Space**: 항목 선택

## 접근성
- \`role="listbox"\`, \`role="option"\` 적용
- \`aria-selected\`로 현재 활성 항목 표시
- \`aria-orientation\`으로 방향 표시
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "리스트 방향",
    },
    loop: {
      control: "boolean",
      description: "끝에서 처음으로 순환",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface MenuItem {
  id: string;
  name: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { id: "home", name: "홈", icon: "🏠" },
  { id: "pets", name: "내 반려동물", icon: "🐕" },
  { id: "chat", name: "AI 상담", icon: "💬" },
  { id: "hospital", name: "병원 찾기", icon: "🏥" },
  { id: "community", name: "커뮤니티", icon: "👥" },
];

// 세로 리스트
export const Vertical: Story = {
  render: () => (
    <FocusableList<MenuItem>
      items={menuItems}
      orientation="vertical"
      loop={true}
      id="menu"
      ariaLabel="메뉴"
      className="w-64 bg-white rounded-lg shadow-lg overflow-hidden"
      itemClassName="cursor-pointer"
      renderItem={(item, _index, isActive) => (
        <div
          className={`flex items-center gap-3 px-4 py-3 ${
            isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium">{item.name}</span>
        </div>
      )}
      onSelect={(item) => {
        console.log("Selected:", item);
      }}
    />
  ),
};

// 가로 리스트
export const Horizontal: Story = {
  render: () => (
    <FocusableList<MenuItem>
      items={menuItems.slice(0, 4)}
      orientation="horizontal"
      loop={true}
      id="nav"
      ariaLabel="네비게이션"
      className="flex bg-white rounded-lg shadow-lg overflow-hidden"
      itemClassName="cursor-pointer"
      renderItem={(item, _index, isActive) => (
        <div
          className={`flex flex-col items-center gap-1 px-6 py-4 ${
            isActive
              ? "bg-blue-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-sm font-medium">{item.name}</span>
        </div>
      )}
      onSelect={(item) => {
        console.log("Selected:", item);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "가로 방향 리스트입니다. 좌우 방향키로 탐색합니다.",
      },
    },
  },
};

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
}

const notifications: NotificationItem[] = [
  { id: "1", title: "예방접종 일정 알림", time: "방금 전", read: false },
  { id: "2", title: "건강검진 결과 도착", time: "1시간 전", read: false },
  { id: "3", title: "산책 기록이 저장되었습니다", time: "3시간 전", read: true },
  { id: "4", title: "새로운 커뮤니티 댓글", time: "어제", read: true },
];

// 알림 리스트
export const NotificationList: Story = {
  render: () => (
    <FocusableList<NotificationItem>
      items={notifications}
      orientation="vertical"
      loop={false}
      id="notifications"
      ariaLabel="알림 목록"
      className="w-80 bg-white rounded-lg shadow-lg overflow-hidden divide-y"
      itemClassName="cursor-pointer"
      renderItem={(item, _index, isActive) => (
        <div
          className={`px-4 py-3 ${
            isActive ? "bg-blue-50" : item.read ? "bg-white" : "bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              {!item.read && (
                <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
              )}
              <span className={`${item.read ? "text-gray-600" : "font-medium"}`}>
                {item.title}
              </span>
            </div>
            <span className="text-xs text-gray-400">{item.time}</span>
          </div>
        </div>
      )}
      onSelect={(item) => {
        console.log("Open notification:", item);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "알림 목록 예시입니다. loop가 false이므로 끝에서 멈춥니다.",
      },
    },
  },
};
