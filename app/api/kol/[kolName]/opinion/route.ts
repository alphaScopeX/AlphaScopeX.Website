import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const backend = process.env.NEXT_PUBLIC_ALPHA_SCOPE_BACKEND_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kolName: string }> }
): Promise<NextResponse<unknown>> {
  try {
    const { kolName } = await context.params;

    const clientQuery = request.nextUrl.searchParams;
    const _backendURL = new URL(
      `/api/v1/trader/token-sentiment`,
      backend
    );
    _backendURL.searchParams.append("userName", kolName);
    clientQuery.forEach((value, key) => {
      _backendURL.searchParams.append(key, value);
    })

    // Notice the parameter callback function of `forEach` function are
    // `(value: string, key: string)`, it's in the reverse order to `(key, value)`.

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
      { error: "Failed to get trader profile." },
      { status: err instanceof Error ? 500 : 502 }
    );
  }
}

