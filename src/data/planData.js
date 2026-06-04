import { getDb } from "./connection.js";

export async function savePlanSuggestion(userId, input, planes) {
    const db = getDb();
    const result = await db.collection("plans").insertOne({
        userId,
        input,
        planes,
        createdAt: new Date(),
    });
    return result;
}

export async function getPlansByUser(userId) {
    const db = getDb();
    return await db
        .collection("plans")
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
}
