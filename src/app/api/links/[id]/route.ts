import { auth } from "../../../../../auth";
import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { updateLinkSchema } from "@/lib/validations/link";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest,
    { params }: {params: {id: string}}
) {
    const session = await auth();

    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }  

    const link = await prisma.link.findFirst({
        where: { id: params.id, userId: session.user._id },
        include: {
            campaign: { select: { id: true, name: true } },
            _count: { select: { clicks: true } },
        },
    });

    if (!link) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json(link);
}

export async function PATCH(req: NextRequest,
    { params }: { params: { id: string } }
) {
   const session = await auth();
   if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }     

   const existing = await prisma.link.findFirst({
    where: { id: params.id, userId: session.user._id },
   });

   if (!existing) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
   }

   try {
    const body = await req.json();
    const data = updateLinkSchema.parse(body);

    const updated = await prisma.link.update({
        where: { id: params.id },
        data,
    });

    // If link is updated, cache redirect is stale - purge it
    if (data.url && data.url !== existing.url) {
        await redis.del(`link:${existing.slug}`)
    }

    return NextResponse.json({ link: updated });

    } catch (err) {
    if ( err instanceof ZodError) {
        return NextResponse.json(
            { error: "Invalid Input", details: err.flatten().fieldErrors },
            { status: 400 },
        );
    }
    return NextResponse.json({error: "Something went wrong"}, { status: 500 });
    }
}

export async function DELETE(req: NextRequest,
    { params }: {params: {id: string}}
){
    const session = await auth();

    if (!session?.user?._id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.link.findFirst({

        where: { id: params.id, userId: session.user._id },
    });
    
    if (!existing) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    //Prisma cascade delete removes related Click rows automatically
    await prisma.link.delete({ where: { id: params.id } });

    //remove from redis so slug can become available immediately
    await redis.del(`link:${existing.slug}`);
    
    return NextResponse.json({ message: "Link deleted" });
}