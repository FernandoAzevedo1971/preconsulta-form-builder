import { z } from 'zod';

// Medical form validation schema
export const medicalFormSchema = z.object({
  // Identificação - Required fields
  nomeCompleto: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome não pode exceder 200 caracteres'),
  dataNascimento: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  idade: z.number(),
  
  // Optional fields with validation
  dataAtual: z.string().optional(),
  indicacao: z.string().max(100).optional(),
  quemIndicou: z.string().max(200).optional(),
  
  // Yes/No fields
  asma: z.enum(['Sim', 'Não', '']).optional(),
  asmaObservacoes: z.string().max(1000).optional(),
  rinite: z.enum(['Sim', 'Não', '']).optional(),
  riniteObservacoes: z.string().max(1000).optional(),
  sinusites: z.enum(['Sim', 'Não', '']).optional(),
  sinusitesObservacoes: z.string().max(1000).optional(),
  enfisema: z.enum(['Sim', 'Não', '']).optional(),
  enfisemaObservacoes: z.string().max(1000).optional(),
  enfisemaBronquite: z.enum(['Sim', 'Não', '']).optional(),
  enfisemaBronquiteObservacoes: z.string().max(1000).optional(),
  pneumonias: z.enum(['Sim', 'Não', '']).optional(),
  pneumoniasObservacoes: z.string().max(1000).optional(),
  tuberculose: z.enum(['Sim', 'Não', '']).optional(),
  tuberculoseObservacoes: z.string().max(1000).optional(),
  outrasRespiratorias: z.enum(['Sim', 'Não', '']).optional(),
  outrasRespiratoriasObservacoes: z.string().max(1000).optional(),
  
  roncos: z.enum(['Sim', 'Não', '']).optional(),
  roncosFrequencia: z.string().max(200).optional(),
  roncosIntensidade: z.number().nullable().optional(),
  roncosObservacoes: z.string().max(1000).optional(),
  insonia: z.enum(['Sim', 'Não', '']).optional(),
  insoniaObservacoes: z.string().max(1000).optional(),
  sonolienciaDiurna: z.enum(['Sim', 'Não', '']).optional(),
  sonolienciaDiurnaObservacoes: z.string().max(1000).optional(),
  outrosProblemasSono: z.enum(['Sim', 'Não', '']).optional(),
  outrosProblemasSonoObservacoes: z.string().max(1000).optional(),
  
  // Epworth scores
  epworthLendo: z.number().nullable().optional(),
  epworthTV: z.number().nullable().optional(),
  epworthPublico: z.number().nullable().optional(),
  epworthTransporte: z.number().nullable().optional(),
  epworthDescansando: z.number().nullable().optional(),
  epworthConversando: z.number().nullable().optional(),
  epworthAposRefeicao: z.number().nullable().optional(),
  epworthDirigindo: z.number().nullable().optional(),
  epworthTotal: z.number().nullable().optional(),
  
  // Cardiovascular
  pressaoAlta: z.enum(['Sim', 'Não', '']).optional(),
  pressaoAltaObservacoes: z.string().max(1000).optional(),
  colesterolAlto: z.enum(['Sim', 'Não', '']).optional(),
  colesterolAltoObservacoes: z.string().max(1000).optional(),
  arritmias: z.enum(['Sim', 'Não', '']).optional(),
  arritmiasObservacoes: z.string().max(1000).optional(),
  outrosCardiacos: z.enum(['Sim', 'Não', '']).optional(),
  outrosCardiacosObservacoes: z.string().max(1000).optional(),
  
  // Endócrino
  diabetes: z.enum(['Sim', 'Não', '']).optional(),
  diabetesObservacoes: z.string().max(1000).optional(),
  tireoide: z.enum(['Sim', 'Não', '']).optional(),
  tireoideObservacoes: z.string().max(1000).optional(),
  
  // Outros sistemas
  neurologicos: z.enum(['Sim', 'Não', '']).optional(),
  neurologicosObservacoes: z.string().max(1000).optional(),
  refluxo: z.enum(['Sim', 'Não', '']).optional(),
  refluxoObservacoes: z.string().max(1000).optional(),
  intestinais: z.enum(['Sim', 'Não', '']).optional(),
  intestinaisObservacoes: z.string().max(1000).optional(),
  figado: z.enum(['Sim', 'Não', '']).optional(),
  figadoObservacoes: z.string().max(1000).optional(),
  urinarios: z.enum(['Sim', 'Não', '']).optional(),
  urinariosObservacoes: z.string().max(1000).optional(),
  articulacoes: z.enum(['Sim', 'Não', '']).optional(),
  articulacoesObservacoes: z.string().max(1000).optional(),
  psiquiatricos: z.enum(['Sim', 'Não', '']).optional(),
  psiquiatricosObservacoes: z.string().max(1000).optional(),
  tromboses: z.enum(['Sim', 'Não', '']).optional(),
  trombosesObservacoes: z.string().max(1000).optional(),
  tumores: z.enum(['Sim', 'Não', '']).optional(),
  tumoresObservacoes: z.string().max(1000).optional(),
  acidentes: z.enum(['Sim', 'Não', '']).optional(),
  acidentesObservacoes: z.string().max(1000).optional(),
  outrosProblemas: z.enum(['Sim', 'Não', '']).optional(),
  outrosProblemasObservacoes: z.string().max(1000).optional(),
  
  // Transfusão
  transfusao: z.enum(['Sim', 'Não', '']).optional(),
  transfusaoDetalhes: z.string().max(1000).optional(),
  
  // Alergias
  alergiasMedicamentos: z.enum(['Sim', 'Não', '']).optional(),
  alergiasMedicamentosLista: z.string().max(1000).optional(),
  alergiasRespiratorias: z.enum(['Sim', 'Não', '']).optional(),
  alergiasRespiratoriasLista: z.string().max(1000).optional(),
  alergiasAlimentares: z.enum(['Sim', 'Não', '']).optional(),
  alergiasAlimentaresLista: z.string().max(1000).optional(),
  
  // Arrays
  medicacoes: z.array(z.string().max(200)).max(11).optional(),
  cirurgias: z.array(z.string().max(200)).max(6).optional(),
  
  // História Familiar
  pai: z.enum(['Vivo', 'Falecido', '']).optional(),
  paiDoencas: z.string().max(500).optional(),
  paiMotivoFalecimento: z.string().max(500).optional(),
  mae: z.enum(['Vivo', 'Falecida', '']).optional(),
  maeDoencas: z.string().max(500).optional(),
  maeMotivoFalecimento: z.string().max(500).optional(),
  avosPaternos: z.enum(['Vivos', 'Falecidos', '']).optional(),
  avosPaternosDoencas: z.string().max(500).optional(),
  avosPaternosMotivo: z.string().max(500).optional(),
  avosMaternos: z.enum(['Vivos', 'Falecidos', '']).optional(),
  avosMaternos_doencas: z.string().max(500).optional(),
  avosMaternos_motivo: z.string().max(500).optional(),
  irmaos: z.enum(['Sim, tenho irmãos', 'Não tenho irmãos', '']).optional(),
  irmaosDoencas: z.string().max(500).optional(),
  filhos: z.enum(['Sim, tenho filhos', 'Não tenho filhos', '']).optional(),
  filhosDoencas: z.string().max(500).optional(),
  outrosParentes: z.enum(['Sim', 'Não', '']).optional(),
  outrosParentesDetalhes: z.string().max(500).optional(),
  
  // Hábitos Pessoais
  fumaAtualmente: z.enum(['Sim', 'Não', '']).optional(),
  idadeComecouFumar: z.number().nullable().optional(),
  tipoFumo: z.string().max(100).optional(),
  idadeInicioFumo: z.number().nullable().optional(),
  idadeCessouFumo: z.number().nullable().optional(),
  cessouRecentemente: z.enum(['Sim', 'Não', '']).optional(),
  jaFumou: z.enum(['Sim', 'Não', '']).optional(),
  idadeComecouFumarEx: z.number().nullable().optional(),
  idadeParouFumar: z.number().nullable().optional(),
  cigarrosPorDia: z.number().nullable().optional(),
  cigarrosPorDiaEx: z.number().nullable().optional(),
  cargaTabagica: z.number().nullable().optional(),
  tabagismoPassivo: z.enum(['Sim', 'Não', '']).optional(),
  tabagismoPassivoDetalhes: z.string().max(500).optional(),
  
  // Álcool
  consumeAlcool: z.enum(['Sim', 'Não', '']).optional(),
  jaConsumiuAlcool: z.enum(['Sim', 'Não', '']).optional(),
  tiposAlcool: z.array(z.string().max(100)).optional(),
  classificacaoConsumo: z.string().max(100).optional(),
  consumoObservacoes: z.string().max(500).optional(),
  
  // Atividade Física
  atividadeFisica: z.enum(['Sim', 'Não', '']).optional(),
  atividadeFisicaPrevia: z.enum(['Sim', 'Não', '']).optional(),
  frequenciaSemanal: z.string().max(100).optional(),
  tipoAtividade: z.string().max(200).optional(),
  tempoTotalSemanal: z.string().max(100).optional(),
  
  // Alimentação
  tipoAlimentacao: z.enum(['sem restrições', 'restrições parciais', 'vegana', '']).optional(),
  tipoAlimentacaoEspecificar: z.string().max(500).optional(),
  
  // Vacinações
  influenza: z.enum(['Sim', 'Não', '']).optional(),
  influenzaAno: z.number().nullable().optional(),
  covid: z.enum(['Sim', 'Não', '']).optional(),
  covidAno: z.number().nullable().optional(),
  covidDoses: z.string().max(100).optional(),
  pneumococcica: z.enum(['Sim', 'Não', '']).optional(),
  pneumococcicaAno: z.number().nullable().optional(),
  tiposPneumococcica: z.array(z.string().max(100)).optional(),
  outrasVacinas: z.array(z.string().max(100)).optional(),
  outrasVacinasTexto: z.string().max(500).optional(),
  
  // Rastreamentos
  colonoscopia: z.enum(['Sim', 'Não', '']).optional(),
  colonoscopiaAno: z.number().nullable().optional(),
  mamografia: z.enum(['Sim', 'Não', '']).optional(),
  mamografiaAno: z.number().nullable().optional(),
  exameUrologico: z.enum(['Sim', 'Não', '']).optional(),
  exameUrologicoAno: z.number().nullable().optional(),
  
  // Outros comentários
  outrosComentarios: z.string().max(2000).optional(),
  
  // Declaração
  declaracao: z.boolean().refine(val => val === true, {
    message: 'É necessário confirmar a declaração para enviar o formulário',
  }),
});

export type ValidatedMedicalFormData = z.infer<typeof medicalFormSchema>;
