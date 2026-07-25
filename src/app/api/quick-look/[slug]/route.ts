import { NextResponse, type NextRequest } from 'next/server';
import { fetchProduct } from '@/lib/api';
import { isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const raw = req.nextUrl.searchParams.get('locale') ?? 'it';
  const locale: Locale = isLocale(raw) ? (raw as Locale) : 'it';

  try {
    const product = await fetchProduct(locale, slug);
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
