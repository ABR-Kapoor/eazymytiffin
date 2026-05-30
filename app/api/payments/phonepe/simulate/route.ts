import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, orderId, amount, status, eventType } = body;

    if (!transactionId || !orderId || !amount || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required simulation parameters." },
        { status: 400 }
      );
    }

    // Retrieve keys from environment
    const saltKey = process.env.PHONEPE_SALT_KEY || "";
    const saltIndex = parseInt(process.env.PHONEPE_SALT_INDEX || "1");

    // Replicate the checksum calculation expected by PhonePe webhook route
    const checksumString = `${orderId}${amount}${status}${saltKey}${saltIndex}`;
    const checksum = crypto
      .createHash("sha256")
      .update(checksumString)
      .digest("hex");

    // Construct Basic Authorization header
    const authHeader = "Basic " + Buffer.from("eazymytiffin:dummy_password").toString("base64");

    // Trigger local webhook route internally
    const webhookUrl = new URL("/api/webhooks/phonepe", req.url).toString();
    
    console.log(`Simulator sending payload to webhook:`, {
      webhookUrl,
      transactionId,
      orderId,
      amount,
      status,
      eventType,
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        transactionId,
        orderId,
        amount,
        status,
        eventType,
        checksum,
      }),
    });

    const result = await response.json();
    console.log("Simulator webhook response:", result);

    if (!response.ok || result.error) {
      return NextResponse.json(
        { success: false, message: result.error || "Webhook processing failed." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Simulation trigger server error:", error);
    return NextResponse.json(
      { success: false, message: "Simulation trigger failed.", error: error.message },
      { status: 500 }
    );
  }
}
