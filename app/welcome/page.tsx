"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function WelcomePage() {
  const params = useSearchParams()
  const sessionId = params.get("session_id") ?? ""
  const [categories, setCategories] = useState<string[]>([])
  const [energy, setEnergy] = useState("")
  const [minutes, setMinutes] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboarding")
      if (raw) {
        const data = JSON.parse(raw)
        if (Array.isArray(data.categories)) setCategories(data.categories)
        if (data.energyLevel) setEnergy(data.energyLevel)
        if (data.availableMinutes) setMinutes(String(data.availableMinutes))
      }
    } catch {}
  }, [])

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: "2rem" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>You&apos;re in.</h1>
        <p style={{ color: "#444", marginBottom: "1rem", lineHeight: 1.7 }}>
          Your first email arrives tomorrow at 8:00 AM.<br />
          One thing. That&apos;s it.
        </p>
        <p style={{ color: "#444", marginBottom: "2rem", lineHeight: 1.7 }}>
          We&apos;ll track what you complete and quietly adjust over time.<br />
          No login needed. Just open the email.
        </p>
        {categories.length > 0 && (
          <div style={{ borderTop: "1px solid #eee", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ color: "#555", marginBottom: "0.5rem" }}>
              <strong>Your categories:</strong> {categories.join(", ")}
            </p>
            {energy && (
              <p style={{ color: "#555", marginBottom: "0.5rem" }}>
                <strong>Energy level:</strong> {energy}
              </p>
            )}
            {minutes && (
              <p style={{ color: "#555" }}>
                <strong>Time available:</strong> {minutes} minutes
              </p>
            )}
          </div>
        )}
        <p style={{ fontSize: "0.85rem", color: "#999", marginTop: "2rem" }}>
          <a href="/account" style={{ color: "#999" }}>Manage your subscription →</a>
        </p>
      </div>
    </main>
  )
}
