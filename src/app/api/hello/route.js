import corsHeaders from "@/lib/cors";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function GET() {
    return NextResponse.json(
        { message: "helloworld from next.js" },
        { headers: corsHeaders }
    );
}
