import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';

describe('Custom Hooks - Unit Tests', () => {
  describe('useOnlineStatus', () => {
    it('tracks online and offline window events accurately', () => {
      Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current).toBe(true);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });
      expect(result.current).toBe(false);

      act(() => {
        window.dispatchEvent(new Event('online'));
      });
      expect(result.current).toBe(true);
    });
  });

  describe('usePWAInstall', () => {
    it('detects beforeinstallprompt event and triggers install prompt', async () => {
      const { result } = renderHook(() => usePWAInstall());
      expect(result.current.isInstallable).toBe(false);
      expect(result.current.isInstalled).toBe(false);

      const promptSpy = vi.fn().mockResolvedValue(undefined);
      const fakeEvent = new Event('beforeinstallprompt') as any;
      fakeEvent.prompt = promptSpy;
      fakeEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

      act(() => {
        window.dispatchEvent(fakeEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      let installedOutcome = false;
      await act(async () => {
        installedOutcome = await result.current.install();
      });

      expect(promptSpy).toHaveBeenCalledTimes(1);
      expect(installedOutcome).toBe(true);
      expect(result.current.isInstalled).toBe(true);
      expect(result.current.isInstallable).toBe(false);
    });

    it('detects iOS user agent accurately', () => {
      const originalUA = window.navigator.userAgent;
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        configurable: true,
      });

      const { result } = renderHook(() => usePWAInstall());
      expect(result.current.isIOS).toBe(true);

      Object.defineProperty(window.navigator, 'userAgent', {
        value: originalUA,
        configurable: true,
      });
    });
  });
});
