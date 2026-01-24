import { render } from "@testing-library/react";
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
} from "../Skeleton";

describe("Skeleton Components", () => {
  describe("Skeleton", () => {
    it("기본 스켈레톤 렌더링", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass("animate-pulse");
      expect(container.firstChild).toHaveClass("bg-gray-200");
    });

    it("커스텀 className 적용", () => {
      const { container } = render(<Skeleton className="w-full h-10" />);
      expect(container.firstChild).toHaveClass("w-full");
      expect(container.firstChild).toHaveClass("h-10");
    });
  });

  describe("SkeletonText", () => {
    it("텍스트 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonText />);
      expect(container.firstChild).toHaveClass("h-4");
    });
  });

  describe("SkeletonCircle", () => {
    it("원형 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonCircle className="w-10 h-10" />);
      expect(container.firstChild).toHaveClass("rounded-full");
    });
  });

  describe("SkeletonCard", () => {
    it("카드 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toHaveClass("rounded-2xl");
    });
  });

  describe("SkeletonPetCard", () => {
    it("펫 카드 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonPetCard />);
      expect(container.firstChild).toHaveClass("rounded-xl");
    });
  });

  describe("SkeletonChatMessage", () => {
    it("AI 메시지 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonChatMessage />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("사용자 메시지 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonChatMessage isUser />);
      expect(container.firstChild).toHaveClass("justify-end");
    });
  });

  describe("SkeletonListItem", () => {
    it("리스트 아이템 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonListItem />);
      expect(container.firstChild).toHaveClass("flex");
    });
  });

  describe("SkeletonPostCard", () => {
    it("게시글 카드 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonPostCard />);
      expect(container.firstChild).toHaveClass("rounded-2xl");
    });
  });

  describe("SkeletonStatCard", () => {
    it("통계 카드 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonStatCard />);
      expect(container.firstChild).toHaveClass("rounded-xl");
    });
  });

  describe("SkeletonPageHeader", () => {
    it("페이지 헤더 스켈레톤 렌더링", () => {
      const { container } = render(<SkeletonPageHeader />);
      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });
  });
});
