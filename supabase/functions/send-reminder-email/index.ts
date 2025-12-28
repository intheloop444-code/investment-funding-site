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

    const reminderEmailContent = {
      to: email,
      subject: "Don't Miss Out - Your Investment Financing Awaits",
      previewText: "We're here to help you close your next deal",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">We're Still Here to Help!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${firstName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              I noticed you haven't completed your application for <strong>${programType}</strong> financing yet. I wanted to reach out one more time because I'd hate for you to miss out on this opportunity.
            </p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">⏰ Time-Sensitive Opportunity</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 0;">
                Real estate markets move fast. Don't let financing delays cost you your next great investment. Our streamlined process can get you pre-approved quickly.
              </p>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 30px;">Why Choose Us?</h3>
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="margin-bottom: 15px;">
                <strong style="color: #1f2937;">✅ Fast Approvals:</strong>
                <span style="color: #4b5563;"> Get pre-approved in 24-48 hours</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #1f2937;">✅ Flexible Terms:</strong>
                <span style="color: #4b5563;"> Customized solutions for every investor</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #1f2937;">✅ Expert Guidance:</strong>
                <span style="color: #4b5563;"> Dedicated support throughout the process</span>
              </div>
              <div>
                <strong style="color: #1f2937;">✅ Proven Track Record:</strong>
                <span style="color: #4b5563;"> Thousands of successful closings</span>
              </div>
            </div>
            
            <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0;">
                📈 Our clients close deals 40% faster than industry average
              </p>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 30px;">Success Story:</h3>
            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #4b5563; line-height: 1.6; font-style: italic; margin: 0;">
                "I was hesitant at first, but after my consultation call, everything clicked. They structured the perfect loan for my fix & flip project, and I closed in 3 weeks. Already working on my second project with them!" - Michael R., Fix & Flip Investor
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="display: inline-block; background: #dc2626; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
                Complete Your Application Now
              </a>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
              Or call us directly at (555) 123-4567 to speak with a loan specialist
            </p>
            
            <div style="border-top: 2px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
              <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
                I understand you're busy, but I'm confident we can help you achieve your investment goals. Let's connect soon!
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; font-size: 14px; margin-top: 20px;">
                Best regards,<br>
                <strong>The Investment Funding Team</strong>
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 Investment Funding. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">This email was sent to ${email}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              <a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Update Preferences</a>
            </p>
          </div>
        </div>
      `,
    };

    console.log("Reminder email prepared for:", email);
    console.log("Email content:", JSON.stringify(reminderEmailContent, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reminder email prepared",
        emailContent: reminderEmailContent 
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