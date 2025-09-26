export interface MedicalFormData {
  // Identificação
  nomeCompleto: string;
  dataNascimento: string;
  dataAtual: string;
  idade: number;
  indicacao: string;
  quemIndicou: string;

  // Histórico Médico - Respiratório
  asma: 'Sim' | 'Não' | '';
  asmaObservacoes: string;
  rinite: 'Sim' | 'Não' | '';
  riniteObservacoes: string;
  sinusites: 'Sim' | 'Não' | '';
  sinusitesObservacoes: string;
  enfisema: 'Sim' | 'Não' | '';
  enfisemaObservacoes: string;
  enfisemaBronquite: 'Sim' | 'Não' | '';
  enfisemaBronquiteObservacoes: string;
  pneumonias: 'Sim' | 'Não' | '';
  pneumoniasObservacoes: string;
  tuberculose: 'Sim' | 'Não' | '';
  tuberculoseObservacoes: string;
  outrasRespiratorias: 'Sim' | 'Não' | '';
  outrasRespiratoriasObservacoes: string;

  // Distúrbios do Sono
  roncos: 'Sim' | 'Não' | '';
  roncosFrequencia: string;
  roncosIntensidade: number;
  roncosObservacoes: string;
  insonia: 'Sim' | 'Não' | '';
  insoniaObservacoes: string;
  sonolienciaDiurna: 'Sim' | 'Não' | '';
  sonolienciaDiurnaObservacoes: string;
  outrosProblemasSono: 'Sim' | 'Não' | '';
  outrosProblemasSonoObservacoes: string;

  // Escala de Epworth
  epworthLendo: number | null;
  epworthTV: number | null;
  epworthPublico: number | null;
  epworthTransporte: number | null;
  epworthDescansando: number | null;
  epworthConversando: number | null;
  epworthAposRefeicao: number | null;
  epworthDirigindo: number | null;
  epworthTotal: number;

  // Cardiovascular
  pressaoAlta: 'Sim' | 'Não' | '';
  pressaoAltaObservacoes: string;
  colesterolAlto: 'Sim' | 'Não' | '';
  colesterolAltoObservacoes: string;
  arritmias: 'Sim' | 'Não' | '';
  arritmiasObservacoes: string;
  outrosCardiacos: 'Sim' | 'Não' | '';
  outrosCardiacosObservacoes: string;

  // Endócrino
  diabetes: 'Sim' | 'Não' | '';
  diabetesObservacoes: string;
  tireoide: 'Sim' | 'Não' | '';
  tireoideObservacoes: string;

  // Outros sistemas
  neurologicos: 'Sim' | 'Não' | '';
  neurologicosObservacoes: string;
  refluxo: 'Sim' | 'Não' | '';
  refluxoObservacoes: string;
  intestinais: 'Sim' | 'Não' | '';
  intestinaisObservacoes: string;
  figado: 'Sim' | 'Não' | '';
  figadoObservacoes: string;
  urinarios: 'Sim' | 'Não' | '';
  urinariosObservacoes: string;
  articulacoes: 'Sim' | 'Não' | '';
  articulacoesObservacoes: string;
  psiquiatricos: 'Sim' | 'Não' | '';
  psiquiatricosObservacoes: string;
  tromboses: 'Sim' | 'Não' | '';
  trombosesObservacoes: string;
  tumores: 'Sim' | 'Não' | '';
  tumoresObservacoes: string;
  acidentes: 'Sim' | 'Não' | '';
  acidentesObservacoes: string;
  outrosProblemas: 'Sim' | 'Não' | '';
  outrosProblemasObservacoes: string;

  // Transfusão
  transfusao: 'Sim' | 'Não' | '';
  transfusaoDetalhes: string;

  // Alergias
  alergiasMedicamentos: 'Sim' | 'Não' | '';
  alergiasMedicamentosLista: string;
  alergiasRespiratorias: 'Sim' | 'Não' | '';
  alergiasRespiratoriasLista: string;
  alergiasAlimentares: 'Sim' | 'Não' | '';
  alergiasAlimentaresLista: string;

  // Medicações (até 11)
  medicacoes: string[];

  // Cirurgias (até 6)
  cirurgias: string[];

  // História Familiar
  pai: 'Vivo' | 'Falecido' | '';
  paiDoencas: string;
  paiMotivoFalecimento: string;
  mae: 'Vivo' | 'Falecida' | '';
  maeDoencas: string;
  maeMotivoFalecimento: string;
  avosPaternos: 'Vivos' | 'Falecidos' | '';
  avosPaternosDoencas: string;
  avosPaternosMotivo: string;
  avosMaternos: 'Vivos' | 'Falecidos' | '';
  avosMaternos_doencas: string;
  avosMaternos_motivo: string;
  irmaos: 'Sim, tenho irmãos' | 'Não tenho irmãos' | '';
  irmaosDoencas: string;
  filhos: 'Sim, tenho filhos' | 'Não tenho filhos' | '';
  filhosDoencas: string;
  outrosParentes: 'Sim' | 'Não' | '';
  outrosParentesDetalhes: string;

  // Hábitos Pessoais
  fumaAtualmente: 'Sim' | 'Não' | '';
  idadeComecouFumar: number | undefined;
  tipoFumo: string;
  idadeInicioFumo: number | undefined;
  idadeCessouFumo: number | undefined;
  cessouRecentemente: 'Sim' | 'Não' | '';
  jaFumou: 'Sim' | 'Não' | '';
  idadeComecouFumarEx: number | undefined;
  idadeParouFumar: number | undefined;
  cigarrosPorDia: number | undefined;
  cigarrosPorDiaEx: number | undefined;
  cargaTabagica: number;
  tabagismoPassivo: 'Sim' | 'Não' | '';
  tabagismoPassivoDetalhes: string;

  // Álcool
  consumeAlcool: 'Sim' | 'Não' | '';
  jaConsumiuAlcool: 'Sim' | 'Não' | '';
  tiposAlcool: string[];
  classificacaoConsumo: string;
  consumoObservacoes: string;

  // Atividade Física
  atividadeFisica: 'Sim' | 'Não' | '';
  atividadeFisicaPrevia: 'Sim' | 'Não' | '';
  frequenciaSemanal: string;
  tipoAtividade: string;
  tempoTotalSemanal: string;

  // Alimentação
  tipoAlimentacao: 'sem restrições' | 'restrições parciais' | 'vegana' | '';
  tipoAlimentacaoEspecificar: string;

  // Vacinações
  influenza: 'Sim' | 'Não' | '';
  influenzaAno: number;
  covid: 'Sim' | 'Não' | '';
  covidAno: number;
  covidDoses: string;
  pneumococcica: 'Sim' | 'Não' | '';
  pneumococcicaAno: number;
  tiposPneumococcica: string[];
  outrasVacinas: string[];
  outrasVacinasTexto: string;

  // Rastreamentos
  colonoscopia: 'Sim' | 'Não' | '';
  colonoscopiaAno: number;
  mamografia: 'Sim' | 'Não' | '';
  mamografiaAno: number;
  exameUrologico: 'Sim' | 'Não' | '';
  exameUrologicoAno: number;

  // Outros comentários
  outrosComentarios: string;

  // Declaração
  declaracao: boolean;
}

export interface EpworthQuestion {
  id: string;
  question: string;
  value: number;
}

export interface MedicalSection {
  id: string;
  title: string;
  questions: MedicalQuestion[];
}

export interface MedicalQuestion {
  id: string;
  label: string;
  type: 'radio' | 'textarea' | 'textbox' | 'number' | 'checkbox' | 'scale' | 'matrix' | 'date';
  options?: string[];
  required?: boolean;
  conditional?: {
    dependsOn: string;
    value: string;
  };
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
}