import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function GET() {
    try {
        const client = await getClientPromise();
        const db = client.db("sample_mflix");
        const result = await db.collection("comments").find({}).skip(0).limit(10).toArray();
        console.log("==> result", result);
        return NextResponse.json(result, {
            headers: corsHeaders
        });
    } catch (exception) {
        console.log("exception", exception.toString());
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
}
