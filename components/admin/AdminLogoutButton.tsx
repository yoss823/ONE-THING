"use client";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      className="text-sm font-medium text-[#666] underline underline-offset-4 hover:text-[#111]"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Log out
    </button>
  );
}
