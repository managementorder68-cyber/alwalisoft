import { type NextRequest, NextResponse } from "next/server"

interface Task {
  id: string
  name: string
  description: string
  category: "channel" | "group" | "video" | "share" | "referral"
  reward: number
  requirement?: string
  isActive: boolean
  isBonus: boolean
  expiresAt?: string
  createdAt: string
}

const tasks: Map<string, Task> = new Map([
  [
    "task_1",
    {
      id: "task_1",
      name: "Join Telegram Channel",
      description: "Subscribe to our main channel",
      category: "channel",
      reward: 5000,
      isActive: true,
      isBonus: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    "task_2",
    {
      id: "task_2",
      name: "Watch Video",
      description: "Watch video content (3+ minutes)",
      category: "video",
      reward: 1000,
      isActive: true,
      isBonus: false,
      createdAt: new Date().toISOString(),
    },
  ],
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const active = searchParams.get("active")

    let result = Array.from(tasks.values())

    if (category) {
      result = result.filter((t) => t.category === category)
    }

    if (active === "true") {
      result = result.filter((t) => t.isActive)
    }

    return NextResponse.json({
      success: true,
      tasks: result,
      total: result.length,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, reward } = body

    if (!name || !category || !reward) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const taskId = `task_${Date.now()}`
    const newTask: Task = {
      id: taskId,
      name,
      description,
      category,
      reward,
      isActive: true,
      isBonus: false,
      createdAt: new Date().toISOString(),
    }

    tasks.set(taskId, newTask)

    return NextResponse.json({ success: true, task: newTask }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
