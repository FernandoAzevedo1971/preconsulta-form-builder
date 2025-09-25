import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MedicalFormData {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  idade?: number;
  indicacao?: string;
  quem_indicou?: string;
  form_data: any;
}

const generatePDFContent = (formData: MedicalFormData): string => {
  const data = formData.form_data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Formulário Médico - ${formData.nome_completo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { font-weight: bold; font-size: 18px; margin-bottom: 15px; color: #333; background-color: #f5f5f5; padding: 8px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-left: 10px; }
        .checkbox-list { margin-left: 15px; }
        .page-break { page-break-before: always; }
        .two-column { display: flex; justify-content: space-between; }
        .column { width: 48%; }
        @media print { .page-break { page-break-before: always; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FORMULÁRIO MÉDICO COMPLETO</h1>
        <p><strong>Data de preenchimento:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div class="section">
        <div class="section-title">DADOS PESSOAIS</div>
        <div class="field"><span class="field-label">Nome Completo:</span><span class="field-value">${formData.nome_completo}</span></div>
        <div class="field"><span class="field-label">Data de Nascimento:</span><span class="field-value">${formData.data_nascimento || 'Não informado'}</span></div>
        <div class="field"><span class="field-label">Idade:</span><span class="field-value">${formData.idade || 'Não informado'} anos</span></div>
        <div class="field"><span class="field-label">Quem indicou:</span><span class="field-value">${formData.quem_indicou || 'Não informado'}</span></div>
        <div class="field"><span class="field-label">Tipo de indicação:</span><span class="field-value">${formData.indicacao || 'Não informado'}</span></div>
      </div>

      <div class="section">
        <div class="section-title">SISTEMA RESPIRATÓRIO</div>
        <div class="field"><span class="field-label">Asma:</span><span class="field-value">${data.asma || 'Não informado'}</span></div>
        ${data.asmaObservacoes ? `<div class="field"><span class="field-label">• Observações Asma:</span><span class="field-value">${data.asmaObservacoes}</span></div>` : ''}
        <div class="field"><span class="field-label">Rinite alérgica:</span><span class="field-value">${data.rinite || 'Não informado'}</span></div>
        ${data.riniteObservacoes ? `<div class="field"><span class="field-label">• Observações Rinite:</span><span class="field-value">${data.riniteObservacoes}</span></div>` : ''}
        <div class="field"><span class="field-label">Sinusites:</span><span class="field-value">${data.sinusites || 'Não informado'}</span></div>
        ${data.sinusitesObservacoes ? `<div class="field"><span class="field-label">• Observações Sinusites:</span><span class="field-value">${data.sinusitesObservacoes}</span></div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">SISTEMA CARDIOVASCULAR</div>
        <div class="field"><span class="field-label">Hipertensão arterial:</span><span class="field-value">${data.hipertensao || 'Não informado'}</span></div>
        ${data.hipertensaoObservacoes ? `<div class="field"><span class="field-label">• Observações Hipertensão:</span><span class="field-value">${data.hipertensaoObservacoes}</span></div>` : ''}
        <div class="field"><span class="field-label">Doença cardíaca:</span><span class="field-value">${data.doencaCardiaca || 'Não informado'}</span></div>
        ${data.doencaCardiacaObservacoes ? `<div class="field"><span class="field-label">• Observações Doença Cardíaca:</span><span class="field-value">${data.doencaCardiacaObservacoes}</span></div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">ESCALA DE SONOLÊNCIA DE EPWORTH</div>
        <div class="field"><span class="field-label">Pontuação Total:</span><span class="field-value">${data.epworthTotal || 0} pontos</span></div>
        <div style="margin-left: 20px;">
          <div class="field">• Lendo sentado: ${data.epworthSentado || 0}</div>
          <div class="field">• Assistindo TV: ${data.epworthTv || 0}</div>
          <div class="field">• Sentado em local público: ${data.epworthPublico || 0}</div>
          <div class="field">• Como passageiro de carro: ${data.epworthPassageiro || 0}</div>
          <div class="field">• Descansando à tarde: ${data.epworthTarde || 0}</div>
          <div class="field">• Conversando com alguém: ${data.epworthConversa || 0}</div>
          <div class="field">• Após almoço sem álcool: ${data.epworthAlmoco || 0}</div>
          <div class="field">• Em carro parado no trânsito: ${data.epworthTransito || 0}</div>
        </div>
      </div>

      <div class="page-break"></div>

      <div class="section">
        <div class="section-title">HÁBITOS PESSOAIS</div>
        <div style="margin-bottom: 15px;">
          <strong>TABAGISMO:</strong>
          <div class="field"><span class="field-label">Fumante:</span><span class="field-value">${data.fumante || 'Não informado'}</span></div>
          ${data.anosProduto ? `<div class="field"><span class="field-label">Anos usando produto:</span><span class="field-value">${data.anosProduto}</span></div>` : ''}
          ${data.cigarrosPorDia ? `<div class="field"><span class="field-label">Cigarros por dia:</span><span class="field-value">${data.cigarrosPorDia}</span></div>` : ''}
          ${data.cargaTabagica ? `<div class="field"><span class="field-label">Carga Tabágica:</span><span class="field-value">${data.cargaTabagica} anos-maço</span></div>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>ÁLCOOL:</strong>
          <div class="field"><span class="field-label">Consome álcool:</span><span class="field-value">${data.consumeAlcool || 'Não informado'}</span></div>
          ${data.frequenciaAlcool ? `<div class="field"><span class="field-label">Frequência:</span><span class="field-value">${data.frequenciaAlcool}</span></div>` : ''}
          ${data.tipoAlcool ? `<div class="field"><span class="field-label">Tipo de bebida:</span><span class="field-value">${data.tipoAlcool}</span></div>` : ''}
        </div>
        
        <div>
          <strong>ATIVIDADE FÍSICA:</strong>
          <div class="field"><span class="field-label">Pratica atividade física:</span><span class="field-value">${data.atividadeFisica || 'Não informado'}</span></div>
          ${data.frequenciaAtividade ? `<div class="field"><span class="field-label">Frequência:</span><span class="field-value">${data.frequenciaAtividade}</span></div>` : ''}
          ${data.tipoAtividade ? `<div class="field"><span class="field-label">Tipo de atividade:</span><span class="field-value">${data.tipoAtividade}</span></div>` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">MEDICAÇÕES EM USO</div>
        ${data.medicacao1 || data.medicacao2 || data.medicacao3 || data.medicacao4 || data.medicacao5 ? 
          '<div style="margin-left: 20px;">' +
          (data.medicacao1 ? `<div class="field">• ${data.medicacao1}</div>` : '') +
          (data.medicacao2 ? `<div class="field">• ${data.medicacao2}</div>` : '') +
          (data.medicacao3 ? `<div class="field">• ${data.medicacao3}</div>` : '') +
          (data.medicacao4 ? `<div class="field">• ${data.medicacao4}</div>` : '') +
          (data.medicacao5 ? `<div class="field">• ${data.medicacao5}</div>` : '') +
          '</div>'
          : '<div class="field">Nenhuma medicação informada</div>'
        }
      </div>

      <div class="section">
        <div class="section-title">HISTÓRICO DE VACINAÇÕES</div>
        <div class="field"><span class="field-label">COVID-19:</span><span class="field-value">${data.vacinaCovid || 'Não informado'}</span></div>
        <div class="field"><span class="field-label">Influenza:</span><span class="field-value">${data.vacinaInfluenza || 'Não informado'}</span></div>
        <div class="field"><span class="field-label">Pneumocócica:</span><span class="field-value">${data.vacinaPneumococica || 'Não informado'}</span></div>
      </div>

      <div class="section">
        <div class="section-title">DECLARAÇÃO LGPD</div>
        <div class="field">
          <span class="field-value">${data.declaracao ? '✓ Paciente concordou com os termos da LGPD e autoriza o uso dos dados' : '✗ Consentimento LGPD não registrado'}</span>
        </div>
      </div>

      <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px;">
        <p><strong>Documento gerado automaticamente pelo sistema</strong></p>
        <p>Data e hora: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId } = await req.json();
    console.log("Processing form ID:", formId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch form data
    const { data: formData, error } = await supabase
      .from('medical_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error("Error fetching form data:", error);
      throw new Error(`Erro ao buscar dados do formulário: ${error.message}`);
    }

    if (!formData) {
      throw new Error("Formulário não encontrado");
    }

    console.log("Form data fetched:", formData.nome_completo);

    // Generate HTML content
    const htmlContent = generatePDFContent(formData);

    // Send email using Resend API directly
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurado");
    }

    const emailData = {
      from: "Formulário Médico <onboarding@resend.dev>",
      to: ["fazevedopneumosono@gmail.com"],
      subject: `Novo Formulário Médico - ${formData.nome_completo}`,
      html: `
        <h2>Novo Formulário Médico Recebido</h2>
        <p><strong>Paciente:</strong> ${formData.nome_completo}</p>
        <p><strong>Data de Nascimento:</strong> ${formData.data_nascimento || 'Não informado'}</p>
        <p><strong>Data de Preenchimento:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        
        <h3>Resumo dos Dados:</h3>
        <ul>
          <li><strong>Idade:</strong> ${formData.idade || 'Não informado'}</li>
          <li><strong>Indicação:</strong> ${formData.indicacao || 'Não informado'}</li>
          <li><strong>Quem indicou:</strong> ${formData.quem_indicou || 'Não informado'}</li>
        </ul>
        
        <hr>
        <h3>Dados Completos do Formulário:</h3>
        ${htmlContent}
      `,
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Erro ao enviar email: ${emailResponse.status} - ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email com dados do formulário enviado com sucesso",
        emailId: emailResult.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-medical-form-pdf function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);