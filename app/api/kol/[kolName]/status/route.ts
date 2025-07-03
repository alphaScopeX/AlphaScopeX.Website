import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const backend = process.env.NEXT_PUBLIC_ALPHA_SCOPE_BACKEND_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kolName: string }> }
): Promise<NextResponse<unknown>> {
  try {
    const { kolName } = await context.params;
    const _backendURL = new URL(
      `/api/v1/trader/sentiment-stats`,
      backend
    );
    _backendURL.searchParams.append("userName", kolName);
    const backendURL = _backendURL.toString();

    const backendRes = await axios.get(backendURL, {
      headers: {
        ...(request.headers.get("Authorization") && {
          Authorization: request.headers.get("Authorization"),
        }),
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(backendRes.data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get trader status." },
      { status: err instanceof Error ? 500 : 502 }
    );
  }
}
