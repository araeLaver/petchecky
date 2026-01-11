import { render, screen, fireEvent } from "@testing-library/react";
import QuickSymptoms from "../QuickSymptoms";

describe("QuickSymptoms", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all symptom buttons", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} />);

    // Check that all symptoms are rendered
    expect(screen.getByText("구토")).toBeInTheDocument();
    expect(screen.getByText("설사")).toBeInTheDocument();
    expect(screen.getByText("식욕부진")).toBeInTheDocument();
    expect(screen.getByText("음수량 변화")).toBeInTheDocument();
    expect(screen.getByText("발열")).toBeInTheDocument();
    expect(screen.getByText("절뚝거림")).toBeInTheDocument();
    expect(screen.getByText("무기력")).toBeInTheDocument();
    expect(screen.getByText("기침/재채기")).toBeInTheDocument();
    expect(screen.getByText("눈 이상")).toBeInTheDocument();
    expect(screen.getByText("귀 이상")).toBeInTheDocument();
    expect(screen.getByText("피부/털")).toBeInTheDocument();
    expect(screen.getByText("호흡 이상")).toBeInTheDocument();
  });

  it("should render the section title", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} />);
    expect(screen.getByText("빠른 증상 선택")).toBeInTheDocument();
  });

  it("should call onSelect with correct query when a symptom is clicked", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} />);

    const vomitButton = screen.getByText("구토").closest("button");
    fireEvent.click(vomitButton!);

    expect(mockOnSelect).toHaveBeenCalledWith("구토를 해요");
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it("should call onSelect with different queries for different symptoms", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText("설사").closest("button")!);
    expect(mockOnSelect).toHaveBeenCalledWith("설사를 해요");

    fireEvent.click(screen.getByText("식욕부진").closest("button")!);
    expect(mockOnSelect).toHaveBeenCalledWith("밥을 안 먹어요");

    fireEvent.click(screen.getByText("호흡 이상").closest("button")!);
    expect(mockOnSelect).toHaveBeenCalledWith("숨쉬기 힘들어해요");
  });

  it("should render emoji icons", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} />);

    expect(screen.getByText("🤮")).toBeInTheDocument();
    expect(screen.getByText("💩")).toBeInTheDocument();
    expect(screen.getByText("😫")).toBeInTheDocument();
    expect(screen.getByText("😰")).toBeInTheDocument();
  });

  it("should disable all buttons when disabled prop is true", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} disabled />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should not call onSelect when disabled", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} disabled />);

    const vomitButton = screen.getByText("구토").closest("button");
    fireEvent.click(vomitButton!);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("should enable all buttons when disabled prop is false", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} disabled={false} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it("should render 12 symptom buttons", () => {
    render(<QuickSymptoms onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(12);
  });
});
