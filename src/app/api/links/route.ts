import { auth } from "../../../../auth";
import { LinkCreateLimiter } from "@/lib/ratelimit";
import { error } from "console";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, limit, remaining, reset } = 
        await LinkCreateLimiter.limit(session.user._id);

    if (!success) {
        return NextResponse.json(
            {error: "Too Many Request, Slow Down!!"},
            {status: 429,
             headers: {
                "X-RateLimit-Limit": String(limit),
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
                },
            }
        );
    }
}