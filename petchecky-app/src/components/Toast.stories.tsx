import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import ToastContainer from './Toast';
import { useEffect } from 'react';

const meta: Meta<typeof ToastContainer> = {
  title: 'Components/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ToastContainer>;

function ToastDemo({ type, message }: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) {
  const { showToast } = useToast();

  useEffect(() => {
    showToast(message, type);
  }, [showToast, type, message]);

  return <ToastContainer />;
}

export const Success: Story = {
  render: () => <ToastDemo type="success" message="저장되었습니다!" />,
};

export const Error: Story = {
  render: () => <ToastDemo type="error" message="오류가 발생했습니다." />,
};

export const Info: Story = {
  render: () => <ToastDemo type="info" message="새로운 업데이트가 있습니다." />,
};

export const Warning: Story = {
  render: () => <ToastDemo type="warning" message="저장 공간이 부족합니다." />,
};

function AllToastsDemo() {
  const { success, info, warning, error } = useToast();

  useEffect(() => {
    success('펫 프로필이 저장되었습니다!');
    setTimeout(() => info('새로운 기능이 추가되었습니다.'), 200);
    setTimeout(() => warning('저장 공간이 80%입니다.'), 400);
    setTimeout(() => error('네트워크 오류가 발생했습니다.'), 600);
  }, [success, info, warning, error]);

  return <ToastContainer />;
}

export const AllTypes: Story = {
  render: () => <AllToastsDemo />,
};
