import { type NextRequest, NextResponse } from "next/server"

interface WithdrawalRequest {
  id: string
  userId: string
  amount: number
  walletAddress: string
  status: "pending" | "processing" | "completed" | "failed"
  txHash?: string
  createdAt: string
  completedAt?: string
}

const withdrawals: Map<string, WithdrawalRequest> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, walletAddress } = body

    if (!userId || !amount || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount < 5000000) {
      return NextResponse.json({ error: "Minimum withdrawal is 5,000,000 coins" }, { status: 400 })
    }

    const withdrawalId = `withdrawal_${Date.now()}`
    const withdrawal: WithdrawalRequest = {
      id: withdrawalId,
      userId,
      amount,
      walletAddress,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    withdrawals.set(withdrawalId, withdrawal)

    return NextResponse.json({ success: true, withdrawal }, { status: 201 })
  } catch (error) {
    console.error("Error creating withdrawal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const userWithdrawals = Array.from(withdrawals.values()).filter((w) => w.userId === userId)

    return NextResponse.json({
      success: true,
      withdrawals: userWithdrawals,
    })
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
