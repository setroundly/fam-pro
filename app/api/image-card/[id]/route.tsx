import { ImageResponse } from "@vercel/og";
import { APP_NAME } from "@/lib/branding";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function getCardData(taskId: string) {
  const supabase = getSupabaseAdmin();

  const { data: post } = await supabase
    .from("timeline_posts")
    .select("*")
    .eq("task_id", taskId)
    .single();

  if (post) {
    return {
      displayName: post.display_name,
      taskTitle: post.task_title,
      amount: post.penalty_amount,
      dest: post.donation_destination,
      body: post.body,
    };
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("title, penalty_amount, donation_destination, users(display_name)")
    .eq("id", taskId)
    .eq("status", "failed")
    .single();

  if (!task) return null;

  const users = task.users as
    | { display_name: string }
    | { display_name: string }[]
    | null;
  const displayName = Array.isArray(users)
    ? (users[0]?.display_name ?? "?")
    : (users?.display_name ?? "?");

  return {
    displayName,
    taskTitle: task.title,
    amount: task.penalty_amount,
    dest: task.donation_destination,
    body: `${displayName}さんが『${task.title}』に失敗しました。${task.penalty_amount}円寄付予定です。`,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const card = await getCardData(id);

  if (!card) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(160deg, #0a0a0a 0%, #1a0a0a 50%, #2d0a0a 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          padding: 64,
        }}
      >
        <CardBrand />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 56, fontWeight: 800 }}>{card.displayName}</div>
          <div style={{ fontSize: 42, color: "#cccccc" }}>
            『{card.taskTitle}』に失敗
          </div>
          <div style={{ fontSize: 40, color: "#ff6b35", fontWeight: 700 }}>
            {card.amount.toLocaleString("ja-JP")}円 寄付予定
          </div>
          <CardDest dest={card.dest} />
        </div>
        <div style={{ fontSize: 26, color: "#777777", lineHeight: 1.4 }}>
          {card.body}
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}

function CardBrand() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "linear-gradient(135deg, #ff5c5c, #e02020)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color: "#fff",
        }}
      >
        ⚡
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#ff4d4d",
          fontWeight: 800,
        }}
      >
        {APP_NAME}
      </div>
    </div>
  );
}

function CardDest({ dest }: { dest: string }) {
  return <div style={{ fontSize: 30, color: "#aaaaaa" }}>寄付先: {dest}</div>;
}
