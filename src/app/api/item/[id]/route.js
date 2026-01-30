import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

const DB_NAME = "wad-01";
const COLLECTION_NAME = "item";

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function GET(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db(DB_NAME);
        const result = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

        if (!result) {
            return NextResponse.json({ message: "Item not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json(result, {
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("GET [id] error:", exception);
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}

export async function PATCH(req, { params }) {
    const { id } = await params;
    try {
        const data = await req.json();
        const updateDoc = {};

        if (data.itemName !== undefined) updateDoc.itemName = data.itemName;
        if (data.itemCategory !== undefined) updateDoc.itemCategory = data.itemCategory;
        if (data.itemPrice !== undefined) updateDoc.itemPrice = parseFloat(data.itemPrice);
        if (data.status !== undefined) updateDoc.status = data.status;

        updateDoc.updatedAt = new Date();

        const client = await getClientPromise();
        const db = client.db(DB_NAME);

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateDoc }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Item not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ message: "Item updated partially" }, {
            status: 200,
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("PATCH [id] error:", exception);
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}

export async function PUT(req, { params }) {
    const { id } = await params;
    try {
        const data = await req.json();
        const { itemName, itemCategory, itemPrice, status } = data;

        if (!itemName || !itemCategory || itemPrice === undefined || !status) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers: corsHeaders });
        }

        const client = await getClientPromise();
        const db = client.db(DB_NAME);

        const result = await db.collection(COLLECTION_NAME).replaceOne(
            { _id: new ObjectId(id) },
            {
                itemName,
                itemCategory,
                itemPrice: parseFloat(itemPrice),
                status,
                updatedAt: new Date()
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Item not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ message: "Item updated successfully" }, {
            status: 200,
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("PUT [id] error:", exception);
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db(DB_NAME);

        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Item not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ message: "Item deleted successfully" }, {
            status: 200,
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("DELETE [id] error:", exception);
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}
