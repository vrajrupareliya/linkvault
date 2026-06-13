import { prisma } from "@/db/prisma";
import { UAParser } from "ua-parser-js";
import { NextRequest } from "next/server";

export async function recordClick(req: NextRequest, linkId: string) {
    // Parse device + browser from User-Agent header
    const ua = new UAParser(req.headers.get("user-agent") || "");
    const device = ua.getDevice().type || "desktop";
    const browser = ua.getBrowser().name || "unknown";
    // Country from Vercel's geo headers 
    const country = req.headers.get("x-vercel-ip-country") ?? "unknown";
    // Referrer
    const referrer = req.headers.get("referer") || "direct";

    await prisma.click.create({
        data:{ linkId: linkId , device, browser, country, referrer },
    });
}