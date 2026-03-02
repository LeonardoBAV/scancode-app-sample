import { Utils, isAndroid, isIOS } from '@nativescript/core';

let cached: string | null = null;

export function useAppVersion(): string {
  if (cached) {
    return cached;
  }

  if (isAndroid) {
    const ctx = Utils.android.getApplicationContext();
    const info = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
    cached = info.versionName;
  } else if (isIOS) {
    cached = NSBundle.mainBundle.objectForInfoDictionaryKey('CFBundleShortVersionString');
  }

  return cached ?? '0.0.0';
}
