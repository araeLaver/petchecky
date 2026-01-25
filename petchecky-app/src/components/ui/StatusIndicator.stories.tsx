import type { Meta, StoryObj } from "@storybook/react";
import { StatusIndicator, FocusableCard, FocusRing } from "./FocusRing";

const StatusIndicatorMeta: Meta<typeof StatusIndicator> = {
  title: "Accessibility/StatusIndicator",
  component: StatusIndicator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
시각적 상태 표시 컴포넌트입니다.

## 접근성 원칙
색상만으로 정보를 전달하지 않고, 아이콘과 텍스트를 함께 사용하여
색맹 사용자도 상태를 인식할 수 있습니다.

## 상태 종류
- **success**: 성공, 완료
- **warning**: 경고, 주의
- **error**: 오류, 실패
- **info**: 정보, 안내
- **neutral**: 중립, 기본
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["success", "warning", "error", "info", "neutral"],
      description: "상태 종류",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "크기",
    },
    showIcon: {
      control: "boolean",
      description: "아이콘 표시",
    },
    showLabel: {
      control: "boolean",
      description: "레이블 표시",
    },
  },
};

export default StatusIndicatorMeta;
type Story = StoryObj<typeof StatusIndicatorMeta>;

// 기본
export const Default: Story = {
  args: {
    status: "success",
    label: "완료됨",
  },
};

// 모든 상태
export const AllStatuses: Story = {
  render: () => (
    <div className="space-y-4">
      <StatusIndicator status="success" label="성공" />
      <StatusIndicator status="warning" label="경고" />
      <StatusIndicator status="error" label="오류" />
      <StatusIndicator status="info" label="정보" />
      <StatusIndicator status="neutral" label="대기" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "모든 상태 변형입니다. 각 상태는 고유한 색상과 아이콘을 가집니다.",
      },
    },
  },
};

// 모든 크기
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <StatusIndicator status="success" label="Small" size="sm" />
      <StatusIndicator status="success" label="Medium" size="md" />
      <StatusIndicator status="success" label="Large" size="lg" />
    </div>
  ),
};

// 아이콘만
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusIndicator status="success" showLabel={false} />
      <StatusIndicator status="warning" showLabel={false} />
      <StatusIndicator status="error" showLabel={false} />
      <StatusIndicator status="info" showLabel={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "아이콘만 표시합니다. 스크린 리더를 위한 숨겨진 레이블은 유지됩니다.",
      },
    },
  },
};

// 실제 사용 예시
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      {/* 예방접종 상태 */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-bold mb-3">예방접종 현황</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>광견병</span>
            <StatusIndicator status="success" label="완료" size="sm" />
          </div>
          <div className="flex justify-between items-center">
            <span>종합백신</span>
            <StatusIndicator status="warning" label="예정됨" size="sm" />
          </div>
          <div className="flex justify-between items-center">
            <span>심장사상충</span>
            <StatusIndicator status="error" label="만료됨" size="sm" />
          </div>
        </div>
      </div>

      {/* 건강검진 결과 */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-bold mb-3">건강검진 결과</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>혈액검사</span>
            <StatusIndicator status="success" label="정상" size="sm" />
          </div>
          <div className="flex justify-between items-center">
            <span>X-ray</span>
            <StatusIndicator status="info" label="검토 중" size="sm" />
          </div>
          <div className="flex justify-between items-center">
            <span>심전도</span>
            <StatusIndicator status="neutral" label="대기" size="sm" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "실제 사용 시나리오에서의 상태 표시기 예시입니다.",
      },
    },
  },
};

// FocusableCard 스토리
export const FocusableCardExample: StoryObj<typeof FocusableCard> = {
  render: () => (
    <div className="space-y-4 w-80">
      <FocusableCard
        onClick={() => console.log("Card 1 clicked")}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐕</div>
          <div>
            <h3 className="font-bold">멍멍이</h3>
            <p className="text-sm text-gray-500">골든 리트리버 · 3살</p>
          </div>
        </div>
      </FocusableCard>

      <FocusableCard
        selected
        onClick={() => console.log("Card 2 clicked")}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐱</div>
          <div>
            <h3 className="font-bold">야옹이</h3>
            <p className="text-sm text-gray-500">페르시안 · 2살</p>
          </div>
        </div>
      </FocusableCard>

      <FocusableCard
        interactive={false}
      >
        <div className="text-center text-gray-500">
          비대화형 카드
        </div>
      </FocusableCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "포커스 가능한 카드 컴포넌트입니다. Tab 키로 이동하고 Enter로 선택할 수 있습니다.",
      },
    },
  },
};

// FocusRing 스토리
export const FocusRingExample: StoryObj<typeof FocusRing> = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Tab 키를 눌러 포커스 링을 확인하세요.
      </p>
      <div className="flex flex-wrap gap-4">
        <FocusRing variant="default" tabIndex={0} className="p-4 bg-gray-100 rounded cursor-pointer">
          Default
        </FocusRing>
        <FocusRing variant="primary" tabIndex={0} className="p-4 bg-gray-100 rounded cursor-pointer">
          Primary
        </FocusRing>
        <FocusRing variant="error" tabIndex={0} className="p-4 bg-gray-100 rounded cursor-pointer">
          Error
        </FocusRing>
        <FocusRing variant="success" tabIndex={0} className="p-4 bg-gray-100 rounded cursor-pointer">
          Success
        </FocusRing>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "포커스 링 래퍼 컴포넌트입니다. 다양한 색상 변형을 지원합니다.",
      },
    },
  },
};
