import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  recipientName: string;
  senderName: string;
  orderNo: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, recipientName, senderName, orderNo, message }: EmailRequest = await req.json();

    console.log("Sending message email to:", to);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #ec4899; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #ec4899; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">💌 New Message from BWITTY NG</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${recipientName}</strong>,</p>

            <p>You have received a new message from <strong>${senderName}</strong> regarding your order <strong>#${orderNo}</strong>:</p>

            <div class="message-box">
              <p style="margin: 0;">${message}</p>
            </div>

            <p>To view your order details and reply to this message, please visit your account:</p>

            <center>
              <a href="https://bwitty.com.ng/account" class="button" style="color: #000; font-weight: bold;">View Order</a>
            </center>

            <p>If you have any questions, please don't hesitate to reach out.</p>

            <p>Best regards,<br>
            <strong>The BWITTY NG Team</strong></p>
          </div>
          <div class="footer">
            <p>BWITTY NG LTD - Everything Bwitty</p>
            <p>This is an automated message. Please do not reply to this email directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "BWITTY NG <noreply@bwitty.com.ng>",
        to: [to],
        subject: `New Message for Order #${orderNo}`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return new Response(
        JSON.stringify({ success: true, messageId: data.id }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }
  } catch (error: any) {
    console.error("Error sending message email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send email",
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
