import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const event = body.event;
    const data = body.data;

    console.log("Paystack webhook received:", event);
    console.log("Payment data:", JSON.stringify(data, null, 2));

    if (event === "charge.success") {
      const reference = data.reference;
      const amount = data.amount / 100;
      const status = data.status;

      console.log(`Payment successful - Reference: ${reference}, Amount: ₦${amount}`);

      if (status === "success") {
        const { data: orders, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("payment.provider", "paystack")
          .filter("payment->reference", "eq", reference);

        if (fetchError) {
          console.error("Error fetching order:", fetchError);
          throw fetchError;
        }

        if (!orders || orders.length === 0) {
          console.log("No matching order found for reference:", reference);
          return new Response(
            JSON.stringify({ success: false, message: "Order not found" }),
            {
              status: 404,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        const order = orders[0];
        console.log("Found order:", order.order_no);

        const currentAuditLog = order.audit_log || [];
        const newAuditEntry = {
          id: Date.now().toString(),
          action: "Payment Confirmed",
          details: `Paystack payment confirmed - Amount: ₦${amount}`,
          timestamp: new Date().toISOString(),
          userId: "system",
          userName: "Paystack Webhook",
        };

        const updatedAuditLog = [...currentAuditLog, newAuditEntry];

        const updatedPayment = {
          ...order.payment,
          status: "completed",
          reference: reference,
          amount: amount,
          completed_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "processing",
            payment: updatedPayment,
            audit_log: updatedAuditLog,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Error updating order:", updateError);
          throw updateError;
        }

        console.log(`Order ${order.order_no} updated to processing with completed payment`);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment confirmed and order updated",
            orderId: order.id,
            orderNo: order.order_no,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Webhook processing failed",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
