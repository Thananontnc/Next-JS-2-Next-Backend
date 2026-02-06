import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

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
        const db = client.db("wad-01");
        const result = await db.collection("user").findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        if (!result) {
            return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
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

export async function PUT(req, { params }) {
    const { id } = await params;
    try {
        const data = await req.json();
        const { username, email, password, firstname, lastname, status } = data;

        const updateDoc = {};
        if (username) updateDoc.username = username;
        if (email) updateDoc.email = email;
        if (firstname) updateDoc.firstname = firstname;
        if (lastname) updateDoc.lastname = lastname;
        if (status) updateDoc.status = status;

        if (password) {
            updateDoc.password = await bcrypt.hash(password, 10);
        }

        updateDoc.updatedAt = new Date();

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("user").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateDoc }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ message: "User updated successfully" }, {
            status: 200,
            headers: corsHeaders
        });
    } catch (exception) {
        console.error("PUT [id] error:", exception);
        const errorMsg = exception.toString();
        let displayErrorMsg = errorMsg;
        if (errorMsg.includes("duplicate")) {
            if (errorMsg.includes("username")) {
                displayErrorMsg = "Duplicate Username!!";
            } else if (errorMsg.includes("email")) {
                displayErrorMsg = "Duplicate Email!!";
            }
        }
        return NextResponse.json({
            message: displayErrorMsg
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
        const db = client.db("wad-01");

        const result = await db.collection("user").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ message: "User deleted successfully" }, {
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
