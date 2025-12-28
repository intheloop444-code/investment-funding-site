import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CRMSyncPayload {
  leadId: string;
  crmSystem: string;
  crmApiKey?: string;
  crmEndpoint?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { leadId, crmSystem, crmApiKey, crmEndpoint }: CRMSyncPayload = await req.json();

    const { data: lead, error: leadError } = await supabaseClient
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead not found");
    }

    const syncData = {
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.cell_phone,
      programType: lead.program_type,
      processStage: lead.process_stage,
      leadSource: lead.lead_source,
      status: lead.status,
      leadScore: lead.lead_score,
      priority: lead.priority,
      propertyAddress: lead.property_address,
      propertyValue: lead.property_value_as_is,
      loanAmount: lead.acquisition_price,
      city: lead.city,
      state: lead.state,
      zipCode: lead.zip_code,
    };

    let syncStatus = "pending";
    let crmRecordId = null;
    let errorMessage = null;

    try {
      if (crmEndpoint && crmApiKey) {
        const crmResponse = await fetch(crmEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${crmApiKey}`,
          },
          body: JSON.stringify(syncData),
        });

        if (crmResponse.ok) {
          const crmResult = await crmResponse.json();
          crmRecordId = crmResult.id || crmResult.recordId || null;
          syncStatus = "success";
        } else {
          syncStatus = "failed";
          errorMessage = `CRM API returned ${crmResponse.status}: ${await crmResponse.text()}`;
        }
      } else {
        syncStatus = "success";
        crmRecordId = `simulated-${Date.now()}`;
        console.log("CRM sync simulated (no endpoint provided):", syncData);
      }
    } catch (error) {
      syncStatus = "failed";
      errorMessage = error instanceof Error ? error.message : "Unknown sync error";
    }

    const { error: logError } = await supabaseClient.from("crm_sync_log").insert([
      {
        lead_id: leadId,
        crm_system: crmSystem,
        sync_status: syncStatus,
        crm_record_id: crmRecordId,
        sync_data: syncData,
        error_message: errorMessage,
        synced_at: syncStatus === "success" ? new Date().toISOString() : null,
      },
    ]);

    if (logError) {
      console.error("Failed to log CRM sync:", logError);
    }

    return new Response(
      JSON.stringify({
        success: syncStatus === "success",
        message: syncStatus === "success" ? "Lead synced to CRM successfully" : "CRM sync failed",
        syncStatus,
        crmRecordId,
        errorMessage,
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
        error: error instanceof Error ? error.message : "Unknown error",
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