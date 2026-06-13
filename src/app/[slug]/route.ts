import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/db/prisma";
import { recordClick } from "@/lib/analytics";

const CACHE_TTL = 60 * 60 * 24; // Cache for 24 hours

type CachedLink = { id: string; url: string; };

export async function GET(
    req: NextRequest, 
    { params }: { params: { slug: string } }) {

    const { slug } = await params;

    const cached = await redis.get<CachedLink>(`link:${slug}`);

    console.log("Cached data:", cached);

    if (cached) {
        // Fire-and-forget — don't await, don't block the redirect
        recordClick(req, cached.id).catch((err) => 
            console.error("Error recording click:", err)
        );
        return NextResponse.redirect(cached.url, 307);
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, url: true, isActive: true, expiresAt: true, slug: true },
    });

    if (!link || !link.isActive) {
        return NextResponse.json(new URL("/not found", req.url), { status: 307 });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
        return NextResponse.redirect(new URL("/link-expired", req.url), 307);
    }

    await redis.set(`link:${slug}`,JSON.stringify(
        { id: link.id, url: link.url }), { ex: CACHE_TTL, }
    );

    console.log("Cached data:", cached);


    recordClick(req, link.id).catch((err) =>
        console.error("Error recording click:", err)
    );

    return NextResponse.redirect(link.url, 307);

}
