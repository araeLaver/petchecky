import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: '테마 선택',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: '라이트 모드' },
          { value: 'dark', icon: 'moon', title: '다크 모드' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: '언어 선택',
      defaultValue: 'ko',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
          { value: 'ja', title: '日本語' },
          { value: 'zh', title: '中文' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      const isDark = theme === 'dark';

      return (
        <div className={isDark ? 'dark' : ''}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f1f5f9' : '#171717',
              minHeight: '100vh',
            }}
          >
            <Story />
          </div>
        </div>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;