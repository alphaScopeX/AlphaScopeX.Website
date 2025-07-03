import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const backend = process.env.NEXT_PUBLIC_ALPHA_SCOPE_BACKEND_URL;

export async function GET(
  request: NextRequest
): Promise<NextResponse<unknown>> {
  try {
    const _backendURL = new URL(
      "/api/v1/market/token-market",
      backend
    );
    const clientQuery = request.nextUrl.searchParams;
    clientQuery.forEach((value, key) => {
      _backendURL.searchParams.append(key, value);
    })

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
      { error: "Failed to get token market" },
      { status: err instanceof Error ? 500 : 502 }
    );
  }
}
