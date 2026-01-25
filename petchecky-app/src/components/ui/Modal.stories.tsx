import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal, ConfirmDialog } from "./Modal";
import { Button } from "./Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
접근성이 개선된 Modal 컴포넌트입니다.

## 주요 기능
- **포커스 트랩**: 모달 내부에서만 포커스가 순환합니다
- **키보드 지원**: Escape 키로 닫기 가능
- **ARIA 속성**: 스크린 리더 지원
- **스크롤 방지**: 모달이 열린 동안 배경 스크롤 차단

## 접근성
- \`role="dialog"\`와 \`aria-modal="true"\` 적용
- 제목과 설명에 \`aria-labelledby\`와 \`aria-describedby\` 연결
- 닫기 버튼에 \`aria-label\` 제공
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "모달 열림 상태",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "모달 크기",
    },
    closeOnOverlayClick: {
      control: "boolean",
      description: "오버레이 클릭 시 닫기",
    },
    closeOnEscape: {
      control: "boolean",
      description: "Escape 키로 닫기",
    },
    showCloseButton: {
      control: "boolean",
      description: "닫기 버튼 표시",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 모달
export const Default: Story = {
  render: function DefaultStory() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="기본 모달"
          description="모달 설명입니다"
        >
          <p className="text-gray-600">모달 내용이 여기에 표시됩니다.</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsOpen(false)}>확인</Button>
          </div>
        </Modal>
      </>
    );
  },
};

// 크기별 모달
export const Sizes: Story = {
  render: function SizesStory() {
    const [openModal, setOpenModal] = useState<"sm" | "md" | "lg" | null>(null);

    return (
      <div className="flex gap-4">
        <Button onClick={() => setOpenModal("sm")}>Small</Button>
        <Button onClick={() => setOpenModal("md")}>Medium</Button>
        <Button onClick={() => setOpenModal("lg")}>Large</Button>

        <Modal
          isOpen={openModal === "sm"}
          onClose={() => setOpenModal(null)}
          title="Small 모달"
          size="sm"
        >
          <p className="text-gray-600">작은 크기의 모달입니다.</p>
        </Modal>

        <Modal
          isOpen={openModal === "md"}
          onClose={() => setOpenModal(null)}
          title="Medium 모달"
          size="md"
        >
          <p className="text-gray-600">중간 크기의 모달입니다.</p>
        </Modal>

        <Modal
          isOpen={openModal === "lg"}
          onClose={() => setOpenModal(null)}
          title="Large 모달"
          size="lg"
        >
          <p className="text-gray-600">큰 크기의 모달입니다.</p>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "모달은 sm, md, lg 세 가지 크기를 지원합니다.",
      },
    },
  },
};

// 폼이 포함된 모달
export const WithForm: Story = {
  render: function WithFormStory() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>폼 모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="정보 입력"
          description="아래 정보를 입력해주세요"
        >
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "폼이 포함된 모달입니다. Tab 키로 입력 필드 간 이동이 가능합니다.",
      },
    },
  },
};

// 확인 다이얼로그
export const ConfirmDialogStory: StoryObj<typeof ConfirmDialog> = {
  render: function ConfirmDialogExample() {
    const [dialog, setDialog] = useState<"info" | "warning" | "danger" | null>(null);

    return (
      <div className="flex gap-4">
        <Button onClick={() => setDialog("info")}>정보</Button>
        <Button variant="secondary" onClick={() => setDialog("warning")}>
          경고
        </Button>
        <Button variant="danger" onClick={() => setDialog("danger")}>
          위험
        </Button>

        <ConfirmDialog
          isOpen={dialog === "info"}
          onClose={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
          title="정보 확인"
          message="이 작업을 진행하시겠습니까?"
          variant="info"
        />

        <ConfirmDialog
          isOpen={dialog === "warning"}
          onClose={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
          title="주의"
          message="이 작업은 되돌릴 수 없을 수 있습니다."
          variant="warning"
          confirmText="계속"
        />

        <ConfirmDialog
          isOpen={dialog === "danger"}
          onClose={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
          title="삭제 확인"
          message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          variant="danger"
          confirmText="삭제"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "확인/취소가 필요한 작업에 사용하는 다이얼로그입니다.",
      },
    },
  },
};

// 닫기 버튼 없음
export const WithoutCloseButton: Story = {
  render: function WithoutCloseButtonStory() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="닫기 버튼 없음"
          showCloseButton={false}
          closeOnOverlayClick={false}
        >
          <p className="text-gray-600 mb-4">
            닫기 버튼이 없는 모달입니다. 아래 버튼으로만 닫을 수 있습니다.
          </p>
          <Button fullWidth onClick={() => setIsOpen(false)}>
            확인
          </Button>
        </Modal>
      </>
    );
  },
};
