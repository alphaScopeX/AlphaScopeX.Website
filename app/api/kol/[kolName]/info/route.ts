import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const backend = process.env.NEXT_PUBLIC_ALPHA_SCOPE_BACKEND_URL;

// Dynamic API route shouldn't use `useParams` to get the dynamic
// route name, because `useParams` is a client-side hook function.
// Just pass the second parameters to `GET` function.

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kolName: string }> }
): Promise<NextResponse<unknown>> {
  try {
    const { kolName } = await context.params;
    const backendURL = new URL(
      `/api/v1/trader/profile/${kolName}`,
      backend
    ).toString();
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
