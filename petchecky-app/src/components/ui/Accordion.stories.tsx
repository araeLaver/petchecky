import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
접근성이 향상된 아코디언 컴포넌트입니다.

## 키보드 네비게이션
- **↑ ↓**: 헤더 간 이동
- **Enter / Space**: 패널 열기/닫기
- **Home**: 첫 번째 헤더로 이동
- **End**: 마지막 헤더로 이동

## 접근성
- \`aria-expanded\`로 열림/닫힘 상태 표시
- \`aria-controls\`와 \`aria-labelledby\`로 헤더-패널 연결
- 각 패널은 \`role="region"\` 적용
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    allowMultiple: {
      control: "boolean",
      description: "여러 패널 동시 열기 허용",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 아코디언
export const Default: Story = {
  args: {
    items: [
      {
        id: "faq1",
        title: "펫체키는 어떤 서비스인가요?",
        content: (
          <p>
            펫체키는 AI 기반 반려동물 건강 관리 서비스입니다. 증상을 입력하면
            AI가 분석하여 적절한 조언을 제공합니다.
          </p>
        ),
      },
      {
        id: "faq2",
        title: "어떤 동물을 지원하나요?",
        content: (
          <p>
            현재 강아지와 고양이를 지원하며, 향후 다른 반려동물도 지원할
            예정입니다.
          </p>
        ),
      },
      {
        id: "faq3",
        title: "비용은 얼마인가요?",
        content: (
          <p>
            기본 기능은 무료로 제공되며, 프리미엄 기능은 월 구독료가 적용됩니다.
            자세한 내용은 요금제 페이지를 확인해주세요.
          </p>
        ),
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};

// 다중 열기 허용
export const AllowMultiple: Story = {
  args: {
    allowMultiple: true,
    items: [
      {
        id: "section1",
        title: "섹션 1",
        content: <p>여러 섹션을 동시에 열 수 있습니다.</p>,
      },
      {
        id: "section2",
        title: "섹션 2",
        content: <p>이 아코디언은 allowMultiple이 true입니다.</p>,
      },
      {
        id: "section3",
        title: "섹션 3",
        content: <p>원하는 만큼 열어볼 수 있습니다.</p>,
      },
    ],
    defaultExpandedIds: ["section1", "section2"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "`allowMultiple` prop을 true로 설정하면 여러 패널을 동시에 열 수 있습니다.",
      },
    },
  },
};

// 비활성화된 항목 포함
export const WithDisabledItem: Story = {
  args: {
    items: [
      {
        id: "active1",
        title: "활성 항목 1",
        content: <p>이 항목은 클릭할 수 있습니다.</p>,
      },
      {
        id: "disabled",
        title: "비활성 항목 (준비 중)",
        content: <p>이 내용은 표시되지 않습니다.</p>,
        disabled: true,
      },
      {
        id: "active2",
        title: "활성 항목 2",
        content: <p>이 항목도 클릭할 수 있습니다.</p>,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "비활성화된 항목은 열거나 닫을 수 없습니다.",
      },
    },
  },
};

// 풍부한 콘텐츠
export const RichContent: Story = {
  args: {
    items: [
      {
        id: "symptoms",
        title: "증상 체크리스트",
        content: (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>구토</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>설사</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>식욕 저하</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>무기력함</span>
            </label>
          </div>
        ),
      },
      {
        id: "emergency",
        title: "응급 상황 안내",
        content: (
          <div className="space-y-3">
            <div className="rounded-lg bg-red-50 p-3 text-red-800">
              <strong>즉시 병원 방문이 필요한 경우:</strong>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>호흡 곤란</li>
                <li>의식 불명</li>
                <li>대량 출혈</li>
                <li>발작</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              위 증상이 나타나면 가장 가까운 24시간 동물병원을 방문해주세요.
            </p>
          </div>
        ),
      },
      {
        id: "prevention",
        title: "예방 수칙",
        content: (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl mb-1">💉</div>
              <div className="text-sm font-medium">정기 예방접종</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl mb-1">🏥</div>
              <div className="text-sm font-medium">정기 건강검진</div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-center">
              <div className="text-2xl mb-1">🍖</div>
              <div className="text-sm font-medium">균형 잡힌 식단</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-2xl mb-1">🏃</div>
              <div className="text-sm font-medium">적절한 운동</div>
            </div>
          </div>
        ),
      },
    ],
    defaultExpandedIds: ["symptoms"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "폼, 리스트, 그리드 등 다양한 콘텐츠를 포함할 수 있습니다.",
      },
    },
  },
};
