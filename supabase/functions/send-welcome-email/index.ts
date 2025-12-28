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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, firstName, lastName, programType }: EmailPayload = await req.json();

    const welcomeEmailContent = {
      to: email,
      subject: "Thank You for Your Application - Next Steps",
      previewText: "We've received your application and are excited to help you!",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Investment Funding</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${firstName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Thank you for submitting your application for <strong>${programType}</strong> financing. We're excited to help you achieve your investment goals!
            </p>
            
            <div style="background: #f3f4f6; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">What Happens Next?</h3>
              <ol style="color: #4b5563; line-height: 1.8;">
                <li>Our team will review your application within 24-48 hours</li>
                <li>We'll contact you via phone or email to discuss your specific needs</li>
                <li>You'll receive a personalized loan proposal tailored to your project</li>
                <li>Once approved, we'll guide you through the closing process</li>
              </ol>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 30px;">Our Loan Programs Include:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li><strong>Bridge Loans:</strong> Short-term financing for quick acquisitions</li>
              <li><strong>Fix & Flip:</strong> Fund your renovation projects</li>
              <li><strong>DSCR/Rental:</strong> Long-term rental property financing</li>
              <li><strong>Commercial:</strong> All types of commercial real estate</li>
              <li><strong>New Construction:</strong> Ground-up development financing</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="#" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Schedule a Consultation
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
              Have questions? Feel free to reply to this email or call us at (555) 123-4567. We're here to help!
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 Investment Funding. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">This email was sent to ${email}</p>
          </div>
        </div>
      `,
    };

    console.log("Welcome email prepared for:", email);
    console.log("Email content:", JSON.stringify(welcomeEmailContent, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email prepared",
        emailContent: welcomeEmailContent 
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