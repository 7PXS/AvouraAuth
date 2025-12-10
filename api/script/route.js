import { promises as fs } from "fs";
import path from "path";

export async function GET(request) {
  const url = new URL(request.url);
  const gameid = url.searchParams.get("gameid");

  if (!gameid) {
    return new Response(JSON.stringify({ error: "Missing gameid" }), { status: 400 });
  }

  try {
    // Match the exact file in api/script/
    const filePath = path.join(process.cwd(), "api", "script", `${gameid}.lua`);

    // Read file contents
    const content = await fs.readFile(filePath, "utf-8");

    // Return as plain text
    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Script not found" }), { status: 404 });
  }
}
