import { type NextRequest, NextResponse } from "next/server"

interface User {
  id: string
  telegramId: string
  username: string
  balance: number
  level: string
  referralCode: string
  referredBy?: string
  tasksCompleted: number
  referralCount: number
  createdAt: string
  lastActive: string
}

// Mock database - replace with actual DB
const users: Map<string, User> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, username, referralCode } = body

    if (!telegramId || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newUser: User = {
      id: userId,
      telegramId,
      username,
      balance: 2000,
      level: "Beginner",
      referralCode: `ref_${userId}`,
      referredBy: referralCode,
      tasksCompleted: 0,
      referralCount: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }

    users.set(userId, newUser)

    return NextResponse.json(
      {
        success: true,
        user: newUser,
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const telegramId = searchParams.get("telegramId")

    let user: User | undefined

    if (userId) {
      user = users.get(userId)
    } else if (telegramId) {
      user = Array.from(users.values()).find((u) => u.telegramId === telegramId)
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
