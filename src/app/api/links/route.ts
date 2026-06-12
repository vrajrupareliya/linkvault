import { auth } from "../../../../auth";
import { LinkCreateLimiter } from "@/lib/ratelimit";
import { NextResponse, NextRequest } from "next/server";
import { generateUniqueSlug, validateSlug, isSlugAvailable } from "@/lib/slug";
import { prisma } from "@/db/prisma";
import { createLinkSchema } from "@/lib/validations/link";
import { ZodError } from "zod";

export async function GET(request: NextRequest){
    const session = await auth();
    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serchParams = new URL(request.url).searchParams;
    const page = Math.max(1, Number(serchParams.get("page") || 1));
    const limit = Math.min(50, Number(serchParams.get("limit") || 10));

    const [links, total] = await Promise.all([
        prisma.link.findMany({
            where: { userId: session.user._id },
            include: {
                _count: { select: { clicks: true }},
                campaign: { select: { id: true,name: true } },
            },
            orderBy: {createdAt: "desc"},
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.link.count({ where: { userId: session.user._id } }),
    ]);

    return NextResponse.json({
        links,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

try {
        const body = await request.json();
        const { url, customSlug, campaignId } = createLinkSchema.parse(body);
    
        let slug: string;
    
        if (customSlug) {
            // User provided a custom slug, validate it and check availability
            const { valid, error } = validateSlug(customSlug);
            
            if (!valid) {
                return NextResponse.json({ error }, { status: 400 });
            }
    
            const isAvailable = await isSlugAvailable(customSlug);
    
            if (!isAvailable) {
                return NextResponse.json({ error: "Slug is already in taken" }, { status: 400 });
            }
            slug = customSlug;
    
        } else {
            // auto generate slug until we find an available one
            slug = await generateUniqueSlug();
            }

        //If campaign ID provided, verify that it belongs to the user

        if (campaignId) {
            const campaign = await prisma.campaign.findFirst({
                where: { id: campaignId, userId: session.user._id },
                select: { id: true },
            });

            if (!campaign) {
                return NextResponse.json(
                    { error: "Campaign not found"}, 
                    { status: 404 }
                );
            }
        }
    
        const link = await prisma.link.create({
            data:{ slug, url, userId: session.user._id, campaignId },
        });
    
        return NextResponse.json({link}, { status: 201});
} catch (err) {
    if ( err instanceof ZodError) {
        return NextResponse.json(
            { error: "Invalid Input", details: err.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    return NextResponse.json(
        {error: "Something went wrong"}, {status: 500});
    }
}