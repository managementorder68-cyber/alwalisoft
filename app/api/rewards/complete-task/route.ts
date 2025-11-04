import { type NextRequest, NextResponse } from "next/server"

interface TaskCompletion {
  userId: string
  taskId: string
  rewardAmount: number
  bonusMultiplier: number
  completedAt: string
}

const completions: TaskCompletion[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, taskId, rewardAmount } = body

    if (!userId || !taskId || !rewardAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if already completed today
    const today = new Date().toDateString()
    const alreadyCompleted = completions.find(
      (c) => c.userId === userId && c.taskId === taskId && new Date(c.completedAt).toDateString() === today,
    )

    if (alreadyCompleted) {
      return NextResponse.json({ error: "Task already completed today" }, { status: 400 })
    }

    const completion: TaskCompletion = {
      userId,
      taskId,
      rewardAmount,
      bonusMultiplier: 1,
      completedAt: new Date().toISOString(),
    }

    completions.push(completion)

    return NextResponse.json(
      {
        success: true,
        reward: rewardAmount,
        message: "Task completed successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
