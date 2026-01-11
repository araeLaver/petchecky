/**
 * LanguageContext Tests
 *
 * Tests for the language context provider including:
 * - Language state management (ko, en, ja)
 * - localStorage persistence
 * - Browser language detection
 * - Translation object access
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the locales module
jest.mock('@/locales', () => ({
  translations: {
    ko: { appTitle: '펫체키' },
    en: { appTitle: 'PetChecky' },
    ja: { appTitle: 'ペットチェッキー' },
  },
  languageNames: {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
  },
  languageFlags: {
    ko: '🇰🇷',
    en: '🇺🇸',
    ja: '🇯🇵',
  },
}));

import { LanguageProvider, useLanguage, useTranslation } from '../LanguageContext';

// Test component that uses the language context
function TestComponent() {
  const { language, setLanguage, languageName, languageFlag, t } = useLanguage();

  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="language-name">{languageName}</span>
      <span data-testid="language-flag">{languageFlag}</span>
      <span data-testid="app-title">{t.appTitle}</span>
      <button onClick={() => setLanguage('ko')}>Set Korean</button>
      <button onClick={() => setLanguage('en')}>Set English</button>
      <button onClick={() => setLanguage('ja')}>Set Japanese</button>
    </div>
  );
}

// Test component for useTranslation hook
function TranslationTestComponent() {
  const t = useTranslation();
  return <span data-testid="translation">{t.appTitle}</span>;
}

describe('LanguageContext', () => {
  const localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset localStorage mock data
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);

    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
        }),
      },
      writable: true,
    });

    // Mock navigator.language to return Korean
    Object.defineProperty(navigator, 'language', {
      value: 'ko-KR',
      writable: true,
      configurable: true,
    });

    // Restore document lang
    document.documentElement.lang = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.lang = '';
  });

  describe('useLanguage hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useLanguage must be used within a LanguageProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('useTranslation hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TranslationTestComponent />);
      }).toThrow('useLanguage must be used within a LanguageProvider');

      consoleSpy.mockRestore();
    });

    it('should return translation object', async () => {
      render(
        <LanguageProvider>
          <TranslationTestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('translation')).toBeInTheDocument();
      });
    });
  });

  describe('LanguageProvider', () => {
    it('should render children', () => {
      render(
        <LanguageProvider>
          <div data-testid="child">Child content</div>
        </LanguageProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should default to Korean', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('ko');
      });
    });

    it('should load saved language from localStorage', async () => {
      localStorageMock['petchecky_language'] = 'en';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('en');
      });
    });

    it('should ignore invalid language values from localStorage', async () => {
      localStorageMock['petchecky_language'] = 'invalid-lang';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        // Should fall back to detected or default language
        expect(['ko', 'en', 'ja']).toContain(screen.getByTestId('language').textContent);
      });
    });
  });

  describe('setLanguage', () => {
    it('should update language to Korean', async () => {
      const user = userEvent.setup();
      localStorageMock['petchecky_language'] = 'en'; // Start with English

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('en');
      });

      await user.click(screen.getByText('Set Korean'));

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('ko');
      });
    });

    it('should update language to English', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await user.click(screen.getByText('Set English'));

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('en');
      });
    });

    it('should update language to Japanese', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await user.click(screen.getByText('Set Japanese'));

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('ja');
      });
    });

    it('should save language to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await user.click(screen.getByText('Set English'));

      expect(localStorageMock['petchecky_language']).toBe('en');
    });

    it('should update document lang attribute', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await user.click(screen.getByText('Set Japanese'));

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('ja');
      });
    });
  });

  describe('language metadata', () => {
    it('should provide correct language name for Korean', async () => {
      localStorageMock['petchecky_language'] = 'ko';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language-name')).toHaveTextContent('한국어');
      });
    });

    it('should provide correct language name for English', async () => {
      localStorageMock['petchecky_language'] = 'en';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language-name')).toHaveTextContent('English');
      });
    });

    it('should provide correct language name for Japanese', async () => {
      localStorageMock['petchecky_language'] = 'ja';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language-name')).toHaveTextContent('日本語');
      });
    });
  });

  describe('translations', () => {
    it('should provide Korean translations', async () => {
      localStorageMock['petchecky_language'] = 'ko';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('app-title')).toHaveTextContent('펫체키');
      });
    });

    it('should provide English translations', async () => {
      localStorageMock['petchecky_language'] = 'en';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('app-title')).toHaveTextContent('PetChecky');
      });
    });

    it('should provide Japanese translations', async () => {
      localStorageMock['petchecky_language'] = 'ja';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('app-title')).toHaveTextContent('ペットチェッキー');
      });
    });

    it('should update translations when language changes', async () => {
      const user = userEvent.setup();
      localStorageMock['petchecky_language'] = 'ko';

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('app-title')).toHaveTextContent('펫체키');
      });

      await user.click(screen.getByText('Set English'));

      await waitFor(() => {
        expect(screen.getByTestId('app-title')).toHaveTextContent('PetChecky');
      });
    });
  });
});
