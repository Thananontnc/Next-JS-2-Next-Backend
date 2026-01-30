import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const DB_NAME = "wad-01";
const COLLECTION_NAME = "item";

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const client = await getClientPromise();
        const db = client.db(DB_NAME);

        const totalItems = await db.collection(COLLECTION_NAME).countDocuments();
        const items = await db.collection(COLLECTION_NAME)
            .find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            items,
            pagination: {
                total: totalItems,
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit)
            }
        }, {
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("GET error:", exception);
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { itemName, itemCategory, itemPrice, status } = data;

        if (!itemName || !itemCategory || itemPrice === undefined) {
            return NextResponse.json({
                message: "Missing required fields"
            }, {
                status: 400,
                headers: corsHeaders
            });
        }

        const client = await getClientPromise();
        const db = client.db(DB_NAME);

        const result = await db.collection(COLLECTION_NAME).insertOne({
            itemName,
            itemCategory,
            itemPrice: parseFloat(itemPrice),
            status: status || "ACTIVE",
            createdAt: new Date()
        });

        return NextResponse.json({
            id: result.insertedId,
            message: "Item created successfully"
        }, {
            status: 201,
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("POST error:", exception);
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}
