import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

config();

const app = new Hono();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:8788";
const DB_NAME = "nstart";
const COLLECTION_NAME = "bookmarks";

let bookmarksCollection: any;

async function connectToMongo() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  bookmarksCollection = db.collection(COLLECTION_NAME);
  console.log("Connected to MongoDB");
}

await connectToMongo();

app.use(
  "/*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.get("/bookmarks", async (c) => {
  const bookmarks = await bookmarksCollection.find({}).toArray();
  return c.json(bookmarks);
});

app.post("/bookmarks", async (c) => {
  const bookmark = await c.req.json();
  const result = await bookmarksCollection.insertOne({
    ...bookmark,
    createdAt: new Date(),
  });
  return c.json({ success: true, id: result.insertedId });
});

app.delete("/bookmarks/:id", async (c) => {
  const id = c.req.param("id");
  await bookmarksCollection.deleteOne({ _id: new ObjectId(id) });
  return c.json({ success: true });
});

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
