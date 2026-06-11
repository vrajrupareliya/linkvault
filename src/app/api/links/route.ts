import { auth } from "../../../../auth";
import { LinkCreateLimiter } from "@/lib/ratelimit";
import { error } from "console";
import { NextResponse, NextRequest } from "next/server";
import { generateUniqueSlug, validateSlug, isSlugAvailable } from "@/lib/slug";
import { prisma } from "@/db/prisma";

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, costomSlug } = await request.json();

    let slug: string;

    if (costomSlug) {
        // User provided a custom slug, validate it and check availability
        const { valid, error } = validateSlug(costomSlug);
        
        if (!valid) {
            return NextResponse.json({ error }, { status: 400 });
        }

        const isAvailable = await isSlugAvailable(costomSlug);

        if (!isAvailable) {
            return NextResponse.json({ error: "Slug is already in taken" }, { status: 400 });
        }
        slug = costomSlug;

    } else {
        // auto generate slug until we find an available one
        slug = await generateUniqueSlug();
        }

    const link = await prisma.link.create({
        data:{ slug, url, userId: session.user._id 
        },
    });


    // redis rate limiting

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