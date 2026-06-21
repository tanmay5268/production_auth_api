import { NextResponse } from 'next/server';
import { env } from "@/utils/configurations";
export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  return NextResponse.json({
    status:`Server running in ${env.NODE_ENV} mode`,
    message: `Server is running at ${origin}`,
  });
}
