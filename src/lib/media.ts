import type { Audience } from '@/lib/types';

/**
 * Local fallback slots under /public/media.
 * Prefer API site-media / hero_url when present.
 */
export function welcomeMediaPath(audience: Audience): string {
  return `/media/welcome-${audience}.jpg`;
}

export function homeHeroMediaPath(audience: Audience): string {
  return `/media/home-${audience}.jpg`;
}

export function homeHeroVideoPaths(audience: Audience): {
  mp4: string;
  webm: string;
} {
  return {
    mp4: `/media/home-${audience}.mp4`,
    webm: `/media/home-${audience}.webm`,
  };
}

export function categoryMediaPath(slug: string): string {
  return `/media/category-${slug}.jpg`;
}

export function brandMediaPath(slug: string): string {
  return `/media/brand-${slug}.jpg`;
}

export async function mediaExists(path: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return false;
  }
  try {
    const { access } = await import('fs/promises');
    const { join } = await import('path');
    const file = join(process.cwd(), 'public', path.replace(/^\//, ''));
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** API URL → local file → null */
export async function preferMedia(
  apiUrl: string | null | undefined,
  localPath: string,
): Promise<string | null> {
  if (apiUrl) {
    return apiUrl;
  }
  return (await mediaExists(localPath)) ? localPath : null;
}
