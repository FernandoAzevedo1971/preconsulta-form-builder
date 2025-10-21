import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib@1.17.1';

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

const generatePDF = async (formData: MedicalFormData): Promise<Uint8Array> => {
  const data = formData.form_data;
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  let yPosition = height - 50;
  const margin = 50;
  const lineHeight = 15;
  
  const addText = (text: string, fontSize: number, font: any, color = rgb(0, 0, 0)) => {
    if (yPosition < 80) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: color,
    });
    yPosition -= lineHeight;
  };
  
  const addSection = (title: string) => {
    yPosition -= 10;
    addText(title, 14, timesRomanBold, rgb(0.2, 0.2, 0.2));
    yPosition -= 5;
  };
  
  const addField = (label: string, value: string) => {
    const text = `${label}: ${value}`;
    addText(text, 11, timesRomanFont);
  };
  
  // Header
  addText('FORMULÁRIO MÉDICO COMPLETO', 18, timesRomanBold);
  addText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 11, timesRomanFont);
  yPosition -= 20;
  
  // Dados Pessoais
  addSection('DADOS PESSOAIS');
  addField('Nome Completo', formData.nome_completo || 'Não informado');
  addField('Data de Nascimento', formData.data_nascimento || 'Não informado');
  addField('Idade', `${formData.idade || 'Não informado'} anos`);
  addField('Quem indicou', formData.quem_indicou || 'Não informado');
  addField('Tipo de indicação', formData.indicacao || 'Não informado');
  
  // Sistema Respiratório
  addSection('SISTEMA RESPIRATÓRIO');
  addField('Asma ou Bronquite Asmática', data.asma || 'Não informado');
  if (data.asmaObservacoes) addField('  Observações', data.asmaObservacoes);
  addField('Rinite alérgica', data.rinite || 'Não informado');
  if (data.riniteObservacoes) addField('  Observações', data.riniteObservacoes);
  addField('Sinusites', data.sinusites || 'Não informado');
  if (data.sinusitesObservacoes) addField('  Observações', data.sinusitesObservacoes);
  addField('Enfisema', data.enfisema || 'Não informado');
  if (data.enfisemaObservacoes) addField('  Observações', data.enfisemaObservacoes);
  addField('Enfisema/Bronquite Crônica', data.enfisemaBronquite || 'Não informado');
  if (data.enfisemaBronquiteObservacoes) addField('  Observações', data.enfisemaBronquiteObservacoes);
  
  // Distúrbios do Sono
  addSection('DISTÚRBIOS DO SONO');
  addField('Roncos ou Apneia do Sono', data.roncos || 'Não informado');
  if (data.roncosObservacoes) addField('  Observações', data.roncosObservacoes);
  addField('Insônia', data.insonia || 'Não informado');
  if (data.insoniaObservacoes) addField('  Observações', data.insoniaObservacoes);
  addField('Sonolência Diurna', data.sonolienciaDiurna || 'Não informado');
  if (data.sonolienciaDiurnaObservacoes) addField('  Observações', data.sonolienciaDiurnaObservacoes);
  
  // Escala de Epworth
  addSection('ESCALA DE SONOLÊNCIA DE EPWORTH');
  addField('Pontuação Total', `${data.epworthTotal || 0} pontos`);
  addField('  Lendo sentado', `${data.epworthLendo ?? 'N/A'}`);
  addField('  Assistindo TV', `${data.epworthTV ?? 'N/A'}`);
  addField('  Sentado em público', `${data.epworthPublico ?? 'N/A'}`);
  addField('  Como passageiro', `${data.epworthTransporte ?? 'N/A'}`);
  addField('  Descansando tarde', `${data.epworthDescansando ?? 'N/A'}`);
  addField('  Conversando', `${data.epworthConversando ?? 'N/A'}`);
  addField('  Após refeição', `${data.epworthAposRefeicao ?? 'N/A'}`);
  addField('  Dirigindo', `${data.epworthDirigindo ?? 'N/A'}`);
  
  // Sistema Cardiovascular
  addSection('SISTEMA CARDIOVASCULAR');
  addField('Pressão Alta', data.pressaoAlta || 'Não informado');
  if (data.pressaoAltaObservacoes) addField('  Observações', data.pressaoAltaObservacoes);
  addField('Colesterol Alto', data.colesterolAlto || 'Não informado');
  if (data.colesterolAltoObservacoes) addField('  Observações', data.colesterolAltoObservacoes);
  
  // Hábitos Pessoais
  addSection('HÁBITOS PESSOAIS - TABAGISMO');
  addField('Fuma atualmente', data.fumaAtualmente || 'Não informado');
  if (data.cargaTabagica) addField('Carga Tabágica', `${data.cargaTabagica} anos-maço`);
  
  addSection('ÁLCOOL');
  addField('Consome álcool', data.consumeAlcool || 'Não informado');
  if (data.classificacaoConsumo) addField('Classificação', data.classificacaoConsumo);
  
  addSection('ATIVIDADE FÍSICA');
  addField('Pratica atividade física', data.atividadeFisica || 'Não informado');
  if (data.frequenciaSemanal) addField('Frequência semanal', data.frequenciaSemanal);
  if (data.tipoAtividade) addField('Tipo', data.tipoAtividade);
  
  // Vacinações
  addSection('VACINAÇÕES');
  addField('Influenza', data.influenza || 'Não informado');
  if (data.influenzaAno) addField('  Ano', `${data.influenzaAno}`);
  addField('COVID-19', data.covid || 'Não informado');
  if (data.covidAno) addField('  Ano', `${data.covidAno}`);
  addField('Pneumocócica', data.pneumococcica || 'Não informado');
  if (data.pneumococcicaAno) addField('  Ano', `${data.pneumococcicaAno}`);
  
  // Rastreamentos
  addSection('RASTREAMENTOS');
  if (data.colonoscopia) {
    addField('Colonoscopia', data.colonoscopia);
    if (data.colonoscopiaAno) addField('  Ano', `${data.colonoscopiaAno}`);
  }
  if (data.mamografia) {
    addField('Mamografia', data.mamografia);
    if (data.mamografiaAno) addField('  Ano', `${data.mamografiaAno}`);
  }
  if (data.exameUrologico) {
    addField('Exame Urológico', data.exameUrologico);
    if (data.exameUrologicoAno) addField('  Ano', `${data.exameUrologicoAno}`);
  }
  
  // Outros Comentários
  if (data.outrosComentarios) {
    addSection('OUTROS COMENTÁRIOS');
    addText(data.outrosComentarios, 11, timesRomanFont);
  }
  
  // LGPD
  addSection('DECLARAÇÃO LGPD');
  addField('Consentimento', data.declaracao ? 'Sim - Autorizado' : 'Não autorizado');
  
  // Footer
  yPosition = 50;
  addText('Documento gerado automaticamente', 9, timesRomanFont, rgb(0.5, 0.5, 0.5));
  addText(`${new Date().toLocaleString('pt-BR')}`, 9, timesRomanFont, rgb(0.5, 0.5, 0.5));
  
  return await pdfDoc.save();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId } = await req.json();
    
    // Validate formId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!formId || !uuidRegex.test(formId)) {
      console.log("Invalid form ID format");
      return new Response(
        JSON.stringify({ error: 'Invalid form ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
      console.error("Error fetching form data");
      throw new Error(`Erro ao buscar dados do formulário`);
    }

    if (!formData) {
      throw new Error("Formulário não encontrado");
    }

    console.log("Form data fetched for ID:", formId);

    // Generate PDF
    console.log("Generating PDF...");
    const pdfBytes = await generatePDF(formData);
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
    console.log("PDF generated successfully");

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
        
        <p><strong>O formulário completo está anexo em PDF.</strong></p>
      `,
      attachments: [
        {
          filename: `formulario-medico-${formData.nome_completo.replace(/\s+/g, '-')}.pdf`,
          content: pdfBase64,
        },
      ],
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