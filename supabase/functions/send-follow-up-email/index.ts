import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  email: string;
  firstName: string;
  lastName: string;
  programType: string;
  leadId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, firstName, lastName, programType, leadId }: EmailPayload = await req.json();

    const followUpEmailContent = {
      to: email,
      subject: "Let's Get Your Financing Started - Quick Questions",
      previewText: "We'd love to help you move forward with your investment",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Let's Move Forward Together</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${firstName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Thanks again for your interest in our <strong>${programType}</strong> program. I wanted to personally follow up and see if you have any questions.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Ready to Take the Next Step?</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 15px;">
                Here's what we can help you with right now:
              </p>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>Review your specific project details</li>
                <li>Provide a customized loan structure</li>
                <li>Answer any questions about rates and terms</li>
                <li>Help you identify the best program for your needs</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #92400e; margin: 0; font-weight: 600;">
                ⚡ Special Note: Borrowers who schedule a consultation within 7 days typically close 40% faster!
              </p>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 30px;">Common Questions We Can Answer:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>What loan amount can I qualify for?</li>
              <li>What are the current interest rates?</li>
              <li>How long does the approval process take?</li>
              <li>What documents do I need to prepare?</li>
              <li>Can you work with my property type/location?</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="display: inline-block; background: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
                Schedule Your Consultation
              </a>
              <a href="mailto:reply@example.com" style="display: inline-block; background: #6b7280; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Reply With Questions
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
              Looking forward to helping you succeed with your investment!
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              <strong>The Investment Funding Team</strong><br>
              (555) 123-4567
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 Investment Funding. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">This email was sent to ${email}</p>
          </div>
        </div>
      `,
    };

    console.log("Follow-up email prepared for:", email);
    console.log("Email content:", JSON.stringify(followUpEmailContent, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Follow-up email prepared",
        emailContent: followUpEmailContent 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
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