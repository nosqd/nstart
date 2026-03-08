import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

config();

const app = new Hono();
const BOOKMARKS_FILE = path.join(process.cwd(), "bookmarks.json");

app.use("/*", cors({
  origin: "*",
  credentials: true,
}));

async function getBookmarks() {
  try {
    const data = await fs.readFile(BOOKMARKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveBookmarks(bookmarks: any[]) {
  await fs.writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
}

app.get("/bookmarks", async (c) => {
  const bookmarks = await getBookmarks();
  return c.json(bookmarks);
});

app.post("/bookmarks", async (c) => {
  const bookmark = await c.req.json();
  const bookmarks = await getBookmarks();
  bookmarks.push({ ...bookmark, id: Date.now().toString() });
  await saveBookmarks(bookmarks);
  return c.json({ success: true });
});

app.delete("/bookmarks/:id", async (c) => {
  const id = c.req.param("id");
  let bookmarks = await getBookmarks();
  bookmarks = bookmarks.filter((b: any) => b.id !== id);
  await saveBookmarks(bookmarks);
  return c.json({ success: true });
});

app.get("/suggest", async (c) => {
  const query = c.req.query("q");
  if (!query) return c.json([]);
  try {
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${query}`,
    );
    if (!response.ok) return c.json([], 500);
    const data = (await response.json()) as any[];
    return c.json(data[1]);
  } catch {
    return c.json([], 500);
  }
});

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
