import { useState, useCallback } from 'react';
import { MedicalFormData } from '@/types/medical-form';

const initialFormData: MedicalFormData = {
  // Identificação
  nomeCompleto: '',
  dataNascimento: '',
  dataAtual: new Date().toISOString().split('T')[0],
  idade: 0,
  indicacao: '',
  quemIndicou: '',

  // Histórico Médico - Respiratório
  asma: '',
  asmaObservacoes: '',
  rinite: '',
  riniteObservacoes: '',
  sinusites: '',
  sinusitesObservacoes: '',
  enfisema: '',
  enfisemaObservacoes: '',
  pneumonias: '',
  pneumoniasObservacoes: '',
  tuberculose: '',
  tuberculoseObservacoes: '',
  outrasRespiratorias: '',
  outrasRespiratoriasObservacoes: '',

  // Distúrbios do Sono
  roncos: '',
  roncosFrequencia: '',
  roncosIntensidade: 0,
  roncosObservacoes: '',
  insonia: '',
  insoniaObservacoes: '',
  sonolienciaDiurna: '',
  sonolienciaDiurnaObservacoes: '',
  outrosProblemasSono: '',
  outrosProblemasSonoObservacoes: '',

  // Escala de Epworth
  epworthLendo: 0,
  epworthTV: 0,
  epworthPublico: 0,
  epworthTransporte: 0,
  epworthDescansando: 0,
  epworthConversando: 0,
  epworthAposRefeicao: 0,
  epworthDirigindo: 0,
  epworthTotal: 0,

  // Cardiovascular
  pressaoAlta: '',
  pressaoAltaObservacoes: '',
  colesterolAlto: '',
  colesterolAltoObservacoes: '',
  arritmias: '',
  arritmiasObservacoes: '',
  outrosCardiacos: '',
  outrosCardiacosObservacoes: '',

  // Endócrino
  diabetes: '',
  diabetesObservacoes: '',
  tireoide: '',
  tireoideObservacoes: '',

  // Outros sistemas
  neurologicos: '',
  neurologicosObservacoes: '',
  refluxo: '',
  refluxoObservacoes: '',
  intestinais: '',
  intestinaisObservacoes: '',
  figado: '',
  figadoObservacoes: '',
  urinarios: '',
  urinariosObservacoes: '',
  articulacoes: '',
  articulacoesObservacoes: '',
  psiquiatricos: '',
  psiquiatricosObservacoes: '',
  tromboses: '',
  trombosesObservacoes: '',
  tumores: '',
  tumoresObservacoes: '',
  acidentes: '',
  acidentesObservacoes: '',
  outrosProblemas: '',
  outrosProblemasObservacoes: '',

  // Transfusão
  transfusao: '',
  transfusaoDetalhes: '',

  // Alergias
  alergiasMedicamentos: '',
  alergiasMedicamentosLista: '',
  alergiasRespiratorias: '',
  alergiasRespiratoriasLista: '',
  alergiasAlimentares: '',
  alergiasAlimentaresLista: '',

  // Medicações (até 11)
  medicacoes: Array(11).fill(''),

  // Cirurgias (até 6)
  cirurgias: Array(6).fill(''),

  // História Familiar
  pai: '',
  paiDoencas: '',
  paiMotivoFalecimento: '',
  mae: '',
  maeDoencas: '',
  maeMotivoFalecimento: '',
  avosPaternos: '',
  avosPaternosDoencas: '',
  avosPaternosMotivo: '',
  avosMaternos: '',
  avosMaternos_doencas: '',
  avosMaternos_motivo: '',
  irmaos: '',
  irmaosDoencas: '',
  filhos: '',
  filhosDoencas: '',
  outrosParentes: '',
  outrosParentesDetalhes: '',

  // Hábitos Pessoais
  fumaAtualmente: '',
  tipoFumo: '',
  idadeInicioFumo: 0,
  idadeCessouFumo: 0,
  cessouRecentemente: '',
  jaFumou: '',
  cigarrosPorDia: 0,
  cargaTabagica: 0,
  tabagismoPassivo: '',
  tabagismoPassivoDetalhes: '',

  // Álcool
  consumeAlcool: '',
  jaConsumiuAlcool: '',
  tiposAlcool: [],
  classificacaoConsumo: '',
  consumoObservacoes: '',

  // Atividade Física
  atividadeFisica: '',
  atividadeFisicaPrevia: '',
  frequenciaSemanal: '',
  tipoAtividade: '',
  tempoTotalSemanal: '',

  // Alimentação
  tipoAlimentacao: '',

  // Vacinações
  influenza: '',
  influenzaAno: 0,
  covid: '',
  covidAno: 0,
  covidDoses: '',
  pneumococcica: '',
  pneumococcicaAno: 0,
  outrasVacinas: [],

  // Rastreamentos
  colonoscopia: '',
  colonoscopiaAno: 0,

  // Declaração
  declaracao: false,
};

export const useMedicalForm = () => {
  const [formData, setFormData] = useState<MedicalFormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);

  const updateField = useCallback((field: keyof MedicalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateArrayField = useCallback((field: keyof MedicalFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  }, []);

  const calculateAge = useCallback((birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }, []);

  const calculateEpworthTotal = useCallback(() => {
    let total = 0;
    setFormData(prev => {
      total = prev.epworthLendo + prev.epworthTV + prev.epworthPublico + 
              prev.epworthTransporte + prev.epworthDescansando + prev.epworthConversando + 
              prev.epworthAposRefeicao + prev.epworthDirigindo;
      
      return { ...prev, epworthTotal: total };
    });
    return total;
  }, []);

  const calculateCargaTabagica = useCallback(() => {
    let carga = 0;
    setFormData(prev => {
      const anos = prev.idadeCessouFumo - prev.idadeInicioFumo;
      const macosPorDia = prev.cigarrosPorDia / 20;
      carga = Math.round(anos * macosPorDia);
      
      return { ...prev, cargaTabagica: carga };
    });
    return carga;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentSection(0);
  }, []);

  const nextSection = useCallback(() => {
    setCurrentSection(prev => prev + 1);
  }, []);

  const prevSection = useCallback(() => {
    setCurrentSection(prev => Math.max(0, prev - 1));
  }, []);

  const goToSection = useCallback((section: number) => {
    setCurrentSection(section);
  }, []);

  return {
    formData,
    currentSection,
    updateField,
    updateArrayField,
    calculateAge,
    calculateEpworthTotal,
    calculateCargaTabagica,
    resetForm,
    nextSection,
    prevSection,
    goToSection,
  };
};