import { type NextRequest, NextResponse } from "next/server"

interface Referral {
  id: string
  referrerId: string
  referredId: string
  level: 1 | 2 | 3
  commission: number
  createdAt: string
}

const referrals: Referral[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referrerId, referredId } = body

    if (!referrerId || !referredId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const referralId = `ref_${Date.now()}`
    const newReferral: Referral = {
      id: referralId,
      referrerId,
      referredId,
      level: 1,
      commission: 1000,
      createdAt: new Date().toISOString(),
    }

    referrals.push(newReferral)

    return NextResponse.json({ success: true, referral: newReferral }, { status: 201 })
  } catch (error) {
    console.error("Error creating referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const referrerId = searchParams.get("referrerId")

    if (!referrerId) {
      return NextResponse.json({ error: "referrerId is required" }, { status: 400 })
    }

    const userReferrals = referrals.filter((r) => r.referrerId === referrerId)
    const totalCommission = userReferrals.reduce((sum, r) => sum + r.commission, 0)

    return NextResponse.json({
      success: true,
      referrals: userReferrals,
      total: userReferrals.length,
      totalCommission,
    })
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
