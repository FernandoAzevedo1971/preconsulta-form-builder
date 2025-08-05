
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send } from 'lucide-react';
import { useMedicalForm } from '@/hooks/useMedicalForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const ContinuousMedicalForm: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const {
    formData,
    updateField,
    updateArrayField,
    calculateAge,
    calculateEpworthTotal,
    calculateCargaTabagica,
  } = useMedicalForm();

  const generatePDF = async (): Promise<Blob> => {
    if (!formRef.current) {
      throw new Error('Referência do formulário não encontrada');
    }

    const canvas = await html2canvas(formRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  };

  const validateForm = (): boolean => {
    if (!formData.nomeCompleto) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome completo.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.declaracao) {
      toast({
        title: "Erro", 
        description: "Por favor, aceite a declaração de veracidade das informações.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDownloadPDF = async () => {
    if (!validateForm()) return;

    try {
      const pdfBlob = await generatePDF();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ficha-medica-${formData.nomeCompleto}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Gerado!",
        description: "O arquivo foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAndEmail = async () => {
    if (!validateForm()) return;

    try {
      // Salvar no Supabase
      const { error: dbError } = await supabase
        .from('medical_forms')
        .insert({
          nome_completo: formData.nomeCompleto,
          data_nascimento: formData.dataNascimento,
          idade: formData.idade,
          indicacao: formData.indicacao,
          quem_indicou: formData.quemIndicou,
          form_data: formData as any
        });

      if (dbError) {
        throw dbError;
      }

      // Gerar PDF
      const pdfBlob = await generatePDF();
      
      // Converter blob para base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Enviar por email
        const { error: emailError } = await supabase.functions.invoke('send-medical-form', {
          body: {
            patientName: formData.nomeCompleto,
            pdfData: base64data.split(',')[1],
            formData: formData
          }
        });

        if (emailError) {
          throw emailError;
        }

        toast({
          title: "Sucesso!",
          description: "Ficha médica enviada por email com sucesso.",
        });
      };
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o formulário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-8 w-8" />
              Ficha de Pré-Avaliação Médica - Formulário Contínuo
            </CardTitle>
            <p className="text-blue-100 mt-2">
              Preencha todos os campos em sequência contínua
            </p>
          </CardHeader>
        </Card>

        {/* Formulário Completamente Contínuo */}
        <Card ref={formRef} className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            
            {/* LGPD Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 leading-relaxed">
                Este formulário está em conformidade com a Lei Geral de Proteção de Dados Pessoais 
                (Lei nº 13.709/2018). As informações coletadas serão tratadas de forma ética e responsável.
              </p>
            </div>

            {/* 1. IDENTIFICAÇÃO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Dados Pessoais</h2>
              
              <div>
                <Label htmlFor="nomeCompleto" className="text-sm font-medium">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={(e) => updateField('nomeCompleto', e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataNascimento" className="text-sm font-medium">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !formData.dataNascimento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataNascimento ? (
                          format(new Date(formData.dataNascimento), "dd/MM/yyyy")
                        ) : (
                          "Selecione a data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.dataNascimento ? new Date(formData.dataNascimento) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const dateString = date.toISOString().split('T')[0];
                            updateField('dataNascimento', dateString);
                            const age = calculateAge(dateString);
                            updateField('idade', age);
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {formData.idade > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Idade Atual</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <span className="text-lg font-semibold text-blue-600">
                        {formData.idade} anos
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="indicacao" className="text-sm font-medium">
                  Quem fez a indicação para o Dr. Fernando Azevedo?
                </Label>
                <RadioGroup
                  value={formData.indicacao}
                  onValueChange={(value) => updateField('indicacao', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Outro médico" id="medico" />
                    <Label htmlFor="medico">Outro médico</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Parente ou amigo" id="parente" />
                    <Label htmlFor="parente">Parente ou amigo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Outros" id="outros" />
                    <Label htmlFor="outros">Outros</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="quemIndicou" className="text-sm font-medium">
                  Cite por favor quem indicou:
                </Label>
                <Input
                  id="quemIndicou"
                  value={formData.quemIndicou}
                  onChange={(e) => updateField('quemIndicou', e.target.value)}
                  placeholder="Nome de quem fez a indicação"
                  className="mt-1"
                />
              </div>
            </div>

            {/* 2. HISTÓRICO RESPIRATÓRIO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Histórico Respiratório</h2>
              
              {[
                { key: 'asma', label: 'Asma / Bronquite', obsKey: 'asmaObservacoes' },
                { key: 'rinite', label: 'Rinite', obsKey: 'riniteObservacoes' },
                { key: 'sinusites', label: 'Sinusites', obsKey: 'sinusitesObservacoes' },
                { key: 'enfisema', label: 'Enfisema / DPOC', obsKey: 'enfisemaObservacoes' },
                { key: 'pneumonias', label: 'Pneumonias prévias', obsKey: 'pneumoniasObservacoes' },
                { key: 'tuberculose', label: 'Tuberculose', obsKey: 'tuberculoseObservacoes' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <RadioGroup
                    value={String(formData[item.key as keyof typeof formData] || '')}
                    onValueChange={(value) => updateField(item.key, value)}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id={`${item.key}-nao`} />
                      <Label htmlFor={`${item.key}-nao`}>Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id={`${item.key}-sim`} />
                      <Label htmlFor={`${item.key}-sim`}>Sim</Label>
                    </div>
                  </RadioGroup>
                  {formData[item.key as keyof typeof formData] === 'Sim' && (
                    <Textarea
                      value={String(formData[item.obsKey as keyof typeof formData] || '')}
                      onChange={(e) => updateField(item.obsKey, e.target.value)}
                      placeholder={`Descreva detalhes sobre ${item.label.toLowerCase()}`}
                      className="bg-blue-50"
                      rows={2}
                    />
                  )}
                </div>
              ))}

              <div>
                <Label className="text-sm font-medium">Outras doenças respiratórias</Label>
                <RadioGroup
                  value={String(formData.outrasRespiratorias || '')}
                  onValueChange={(value) => updateField('outrasRespiratorias', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outras-resp-nao" />
                    <Label htmlFor="outras-resp-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outras-resp-sim" />
                    <Label htmlFor="outras-resp-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrasRespiratorias === 'Sim' && (
                  <Textarea
                    value={String(formData.outrasRespiratoriasObservacoes || '')}
                    onChange={(e) => updateField('outrasRespiratoriasObservacoes', e.target.value)}
                    placeholder="Descreva outras doenças respiratórias"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* 3. DISTÚRBIOS DO SONO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Distúrbios do Sono</h2>
              
              <div>
                <Label className="text-sm font-medium">Roncos</Label>
                <RadioGroup
                  value={String(formData.roncos || '')}
                  onValueChange={(value) => updateField('roncos', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="roncos-nao" />
                    <Label htmlFor="roncos-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="roncos-sim" />
                    <Label htmlFor="roncos-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.roncos === 'Sim' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Frequência dos roncos</Label>
                      <RadioGroup
                        value={String(formData.roncosFrequencia || '')}
                        onValueChange={(value) => updateField('roncosFrequencia', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Ocasional" id="roncos-ocasional" />
                          <Label htmlFor="roncos-ocasional">Ocasional</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Frequente" id="roncos-frequente" />
                          <Label htmlFor="roncos-frequente">Frequente</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Todas as noites" id="roncos-todas" />
                          <Label htmlFor="roncos-todas">Todas as noites</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Intensidade dos roncos (0-10)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.roncosIntensidade || ''}
                        onChange={(e) => updateField('roncosIntensidade', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <Textarea
                      value={String(formData.roncosObservacoes || '')}
                      onChange={(e) => updateField('roncosObservacoes', e.target.value)}
                      placeholder="Observações sobre os roncos"
                      className="bg-blue-50"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Insônia (dificuldade para dormir)</Label>
                <RadioGroup
                  value={String(formData.insonia || '')}
                  onValueChange={(value) => updateField('insonia', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="insonia-nao" />
                    <Label htmlFor="insonia-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="insonia-sim" />
                    <Label htmlFor="insonia-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.insonia === 'Sim' && (
                  <Textarea
                    value={String(formData.insoniaObservacoes || '')}
                    onChange={(e) => updateField('insoniaObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre insônia"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Sonolência excessiva durante o dia</Label>
                <RadioGroup
                  value={String(formData.sonolienciaDiurna || '')}
                  onValueChange={(value) => updateField('sonolienciaDiurna', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="sonolencia-nao" />
                    <Label htmlFor="sonolencia-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="sonolencia-sim" />
                    <Label htmlFor="sonolencia-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.sonolienciaDiurna === 'Sim' && (
                  <Textarea
                    value={String(formData.sonolienciaDiurnaObservacoes || '')}
                    onChange={(e) => updateField('sonolienciaDiurnaObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre sonolência diurna"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Outros problemas do sono</Label>
                <RadioGroup
                  value={String(formData.outrosProblemasSono || '')}
                  onValueChange={(value) => updateField('outrosProblemasSono', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outros-sono-nao" />
                    <Label htmlFor="outros-sono-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outros-sono-sim" />
                    <Label htmlFor="outros-sono-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosProblemasSono === 'Sim' && (
                  <Textarea
                    value={String(formData.outrosProblemasSonoObservacoes || '')}
                    onChange={(e) => updateField('outrosProblemasSonoObservacoes', e.target.value)}
                    placeholder="Descreva outros problemas do sono"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* 4. ESCALA DE EPWORTH */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Escala de Sonolência de Epworth</h2>
              <p className="text-sm text-gray-600">
                Qual a probabilidade de você cochilar ou adormecer nas seguintes situações? 
                (0 = Nunca cochilaria, 1 = Pequena probabilidade, 2 = Probabilidade moderada, 3 = Grande probabilidade)
              </p>
              
              <div className="space-y-4">
                {[
                  { key: 'epworthLendo', label: 'Sentado lendo' },
                  { key: 'epworthTV', label: 'Assistindo TV' },
                  { key: 'epworthPublico', label: 'Sentado inativo em local público' },
                  { key: 'epworthTransporte', label: 'Como passageiro de carro por 1 hora' },
                  { key: 'epworthDescansando', label: 'Descansando à tarde' },
                  { key: 'epworthConversando', label: 'Sentado conversando com alguém' },
                  { key: 'epworthAposRefeicao', label: 'Sentado após almoço sem álcool' },
                  { key: 'epworthDirigindo', label: 'No carro parado no trânsito' }
                ].map((item) => (
                  <div key={item.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <Label className="text-sm">{item.label}</Label>
                    <RadioGroup
                      value={String(formData[item.key as keyof typeof formData] || '')}
                      onValueChange={(value) => updateField(item.key as any, parseInt(value))}
                      className="flex flex-row gap-4"
                    >
                      {[0, 1, 2, 3].map((score) => (
                        <div key={score} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(score)} id={`${item.key}-${score}`} />
                          <Label htmlFor={`${item.key}-${score}`}>{score}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 rounded-md">
                <Label className="text-sm font-medium">Total da Escala de Epworth</Label>
                <div className="text-lg font-semibold text-blue-600">
                  {calculateEpworthTotal()} pontos
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {calculateEpworthTotal() > 10 ? 'Sonolência excessiva' : 'Sonolência normal'}
                </p>
              </div>
            </div>

            {/* 5. SISTEMA CARDIOVASCULAR */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Sistema Cardiovascular</h2>
              
              {[
                { key: 'pressaoAlta', label: 'Pressão alta', obsKey: 'pressaoAltaObservacoes' },
                { key: 'colesterolAlto', label: 'Colesterol alto', obsKey: 'colesterolAltoObservacoes' },
                { key: 'arritmias', label: 'Arritmias cardíacas', obsKey: 'arritmiasObservacoes' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <RadioGroup
                    value={String(formData[item.key as keyof typeof formData] || '')}
                    onValueChange={(value) => updateField(item.key, value)}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id={`${item.key}-nao`} />
                      <Label htmlFor={`${item.key}-nao`}>Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id={`${item.key}-sim`} />
                      <Label htmlFor={`${item.key}-sim`}>Sim</Label>
                    </div>
                  </RadioGroup>
                  {formData[item.key as keyof typeof formData] === 'Sim' && (
                    <Textarea
                      value={String(formData[item.obsKey as keyof typeof formData] || '')}
                      onChange={(e) => updateField(item.obsKey, e.target.value)}
                      placeholder={`Descreva detalhes sobre ${item.label.toLowerCase()}`}
                      className="bg-blue-50"
                      rows={2}
                    />
                  )}
                </div>
              ))}

              <div>
                <Label className="text-sm font-medium">Outros problemas cardíacos</Label>
                <RadioGroup
                  value={String(formData.outrosCardiacos || '')}
                  onValueChange={(value) => updateField('outrosCardiacos', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="cardiaca-nao" />
                    <Label htmlFor="cardiaca-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="cardiaca-sim" />
                    <Label htmlFor="cardiaca-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosCardiacos === 'Sim' && (
                  <Textarea
                    value={String(formData.outrosCardiacosObservacoes || '')}
                    onChange={(e) => updateField('outrosCardiacosObservacoes', e.target.value)}
                    placeholder="Descreva outros problemas cardíacos"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* 6. SISTEMA ENDÓCRINO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Sistema Endócrino</h2>
              
              {[
                { key: 'diabetes', label: 'Diabetes', obsKey: 'diabetesObservacoes' },
                { key: 'tireoide', label: 'Problemas de tireoide', obsKey: 'tireoideObservacoes' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <RadioGroup
                    value={String(formData[item.key as keyof typeof formData] || '')}
                    onValueChange={(value) => updateField(item.key, value)}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id={`${item.key}-nao`} />
                      <Label htmlFor={`${item.key}-nao`}>Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id={`${item.key}-sim`} />
                      <Label htmlFor={`${item.key}-sim`}>Sim</Label>
                    </div>
                  </RadioGroup>
                  {formData[item.key as keyof typeof formData] === 'Sim' && (
                    <Textarea
                      value={String(formData[item.obsKey as keyof typeof formData] || '')}
                      onChange={(e) => updateField(item.obsKey, e.target.value)}
                      placeholder={`Descreva detalhes sobre ${item.label.toLowerCase()}`}
                      className="bg-blue-50"
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* 7. OUTROS SISTEMAS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Outros Sistemas</h2>
              
              {[
                { key: 'neurologicos', label: 'Problemas neurológicos', obsKey: 'neurologicosObservacoes' },
                { key: 'refluxo', label: 'Refluxo gastroesofágico', obsKey: 'refluxoObservacoes' },
                { key: 'intestinais', label: 'Problemas intestinais', obsKey: 'intestinaisObservacoes' },
                { key: 'figado', label: 'Problemas no fígado', obsKey: 'figadoObservacoes' },
                { key: 'urinarios', label: 'Problemas urinários', obsKey: 'urinariosObservacoes' },
                { key: 'articulacoes', label: 'Problemas nas articulações', obsKey: 'articulacoesObservacoes' },
                { key: 'psiquiatricos', label: 'Problemas psiquiátricos', obsKey: 'psiquiatricosObservacoes' },
                { key: 'tromboses', label: 'Tromboses', obsKey: 'trombosesObservacoes' },
                { key: 'tumores', label: 'Tumores', obsKey: 'tumoresObservacoes' },
                { key: 'acidentes', label: 'Acidentes graves', obsKey: 'acidentesObservacoes' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <RadioGroup
                    value={String(formData[item.key as keyof typeof formData] || '')}
                    onValueChange={(value) => updateField(item.key, value)}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id={`${item.key}-nao`} />
                      <Label htmlFor={`${item.key}-nao`}>Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id={`${item.key}-sim`} />
                      <Label htmlFor={`${item.key}-sim`}>Sim</Label>
                    </div>
                  </RadioGroup>
                  {formData[item.key as keyof typeof formData] === 'Sim' && (
                    <Textarea
                      value={String(formData[item.obsKey as keyof typeof formData] || '')}
                      onChange={(e) => updateField(item.obsKey, e.target.value)}
                      placeholder={`Descreva detalhes sobre ${item.label.toLowerCase()}`}
                      className="bg-blue-50"
                      rows={2}
                    />
                  )}
                </div>
              ))}

              <div>
                <Label className="text-sm font-medium">Outros problemas de saúde</Label>
                <RadioGroup
                  value={String(formData.outrosProblemas || '')}
                  onValueChange={(value) => updateField('outrosProblemas', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outros-nao" />
                    <Label htmlFor="outros-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outros-sim" />
                    <Label htmlFor="outros-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosProblemas === 'Sim' && (
                  <Textarea
                    value={String(formData.outrosProblemasObservacoes || '')}
                    onChange={(e) => updateField('outrosProblemasObservacoes', e.target.value)}
                    placeholder="Descreva outros problemas de saúde"
                    className="bg-blue-50 mt-2"
                    rows={3}
                  />
                )}
              </div>
            </div>

            {/* 8. TRANSFUSÃO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Transfusão Sanguínea</h2>
              
              <div>
                <Label className="text-sm font-medium">Já recebeu transfusão de sangue?</Label>
                <RadioGroup
                  value={String(formData.transfusao || '')}
                  onValueChange={(value) => updateField('transfusao', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="transfusao-nao" />
                    <Label htmlFor="transfusao-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="transfusao-sim" />
                    <Label htmlFor="transfusao-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.transfusao === 'Sim' && (
                  <Textarea
                    value={String(formData.transfusaoDetalhes || '')}
                    onChange={(e) => updateField('transfusaoDetalhes', e.target.value)}
                    placeholder="Descreva quando e por que recebeu transfusão"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* 9. ALERGIAS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Alergias</h2>
              
              {[
                { key: 'alergiasMedicamentos', label: 'Alergias a medicamentos', listKey: 'alergiasMedicamentosLista' },
                { key: 'alergiasRespiratorias', label: 'Alergias respiratórias', listKey: 'alergiasRespiratoriasLista' },
                { key: 'alergiasAlimentares', label: 'Alergias alimentares', listKey: 'alergiasAlimentaresLista' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <RadioGroup
                    value={String(formData[item.key as keyof typeof formData] || '')}
                    onValueChange={(value) => updateField(item.key, value)}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id={`${item.key}-nao`} />
                      <Label htmlFor={`${item.key}-nao`}>Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id={`${item.key}-sim`} />
                      <Label htmlFor={`${item.key}-sim`}>Sim</Label>
                    </div>
                  </RadioGroup>
                  {formData[item.key as keyof typeof formData] === 'Sim' && (
                    <Textarea
                      value={String(formData[item.listKey as keyof typeof formData] || '')}
                      onChange={(e) => updateField(item.listKey, e.target.value)}
                      placeholder={`Liste suas ${item.label.toLowerCase()}`}
                      className="bg-blue-50"
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* 10. MEDICAÇÕES EM USO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Medicações em Uso</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={i}>
                    <Label className="text-sm font-medium">Medicação {i + 1}</Label>
                    <Input
                      value={formData.medicacoes[i] || ''}
                      onChange={(e) => updateArrayField('medicacoes', i, e.target.value)}
                      placeholder={`Nome da medicação ${i + 1}`}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 11. CIRURGIAS ANTERIORES */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Cirurgias Anteriores</h2>
              
              <div className="space-y-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i}>
                    <Label className="text-sm font-medium">Cirurgia {i + 1}</Label>
                    <Textarea
                      value={formData.cirurgias[i] || ''}
                      onChange={(e) => updateArrayField('cirurgias', i, e.target.value)}
                      placeholder={`Descreva a cirurgia ${i + 1} (tipo, data, motivo)`}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 12. HISTÓRIA FAMILIAR */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">História Familiar</h2>
              
              {/* Pai */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pai</h3>
                <RadioGroup
                  value={String(formData.pai || '')}
                  onValueChange={(value) => updateField('pai', value)}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Vivo" id="pai-vivo" />
                    <Label htmlFor="pai-vivo">Vivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Falecido" id="pai-falecido" />
                    <Label htmlFor="pai-falecido">Falecido</Label>
                  </div>
                </RadioGroup>
                
                <div>
                  <Label className="text-sm font-medium">Doenças do pai</Label>
                  <Textarea
                    value={String(formData.paiDoencas || '')}
                    onChange={(e) => updateField('paiDoencas', e.target.value)}
                    placeholder="Liste as doenças do pai"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                {formData.pai === 'Falecido' && (
                  <div>
                    <Label className="text-sm font-medium">Motivo do falecimento</Label>
                    <Textarea
                      value={String(formData.paiMotivoFalecimento || '')}
                      onChange={(e) => updateField('paiMotivoFalecimento', e.target.value)}
                      placeholder="Motivo do falecimento do pai"
                      className="mt-1 bg-red-50"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Mãe */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mãe</h3>
                <RadioGroup
                  value={String(formData.mae || '')}
                  onValueChange={(value) => updateField('mae', value)}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Viva" id="mae-viva" />
                    <Label htmlFor="mae-viva">Viva</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Falecida" id="mae-falecida" />
                    <Label htmlFor="mae-falecida">Falecida</Label>
                  </div>
                </RadioGroup>
                
                <div>
                  <Label className="text-sm font-medium">Doenças da mãe</Label>
                  <Textarea
                    value={String(formData.maeDoencas || '')}
                    onChange={(e) => updateField('maeDoencas', e.target.value)}
                    placeholder="Liste as doenças da mãe"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                {formData.mae === 'Falecida' && (
                  <div>
                    <Label className="text-sm font-medium">Motivo do falecimento</Label>
                    <Textarea
                      value={String(formData.maeMotivoFalecimento || '')}
                      onChange={(e) => updateField('maeMotivoFalecimento', e.target.value)}
                      placeholder="Motivo do falecimento da mãe"
                      className="mt-1 bg-red-50"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Avós Paternos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Avós Paternos</h3>
                <RadioGroup
                  value={String(formData.avosPaternos || '')}
                  onValueChange={(value) => updateField('avosPaternos', value)}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Vivos" id="avos-paternos-vivos" />
                    <Label htmlFor="avos-paternos-vivos">Vivos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Falecidos" id="avos-paternos-falecidos" />
                    <Label htmlFor="avos-paternos-falecidos">Falecidos</Label>
                  </div>
                </RadioGroup>
                
                <div>
                  <Label className="text-sm font-medium">Doenças dos avós paternos</Label>
                  <Textarea
                    value={String(formData.avosPaternosDoencas || '')}
                    onChange={(e) => updateField('avosPaternosDoencas', e.target.value)}
                    placeholder="Liste as doenças dos avós paternos"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                {formData.avosPaternos === 'Falecidos' && (
                  <div>
                    <Label className="text-sm font-medium">Motivo dos falecimentos</Label>
                    <Textarea
                      value={String(formData.avosPaternosMotivo || '')}
                      onChange={(e) => updateField('avosPaternosMotivo', e.target.value)}
                      placeholder="Motivos dos falecimentos dos avós paternos"
                      className="mt-1 bg-red-50"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Avós Maternos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Avós Maternos</h3>
                <RadioGroup
                  value={String(formData.avosMaternos || '')}
                  onValueChange={(value) => updateField('avosMaternos', value)}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Vivos" id="avos-maternos-vivos" />
                    <Label htmlFor="avos-maternos-vivos">Vivos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Falecidos" id="avos-maternos-falecidos" />
                    <Label htmlFor="avos-maternos-falecidos">Falecidos</Label>
                  </div>
                </RadioGroup>
                
                <div>
                  <Label className="text-sm font-medium">Doenças dos avós maternos</Label>
                  <Textarea
                    value={String(formData.avosMaternos_doencas || '')}
                    onChange={(e) => updateField('avosMaternos_doencas', e.target.value)}
                    placeholder="Liste as doenças dos avós maternos"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                {formData.avosMaternos === 'Falecidos' && (
                  <div>
                    <Label className="text-sm font-medium">Motivo dos falecimentos</Label>
                    <Textarea
                      value={String(formData.avosMaternos_motivo || '')}
                      onChange={(e) => updateField('avosMaternos_motivo', e.target.value)}
                      placeholder="Motivos dos falecimentos dos avós maternos"
                      className="mt-1 bg-red-50"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Irmãos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Irmãos</h3>
                <div>
                  <Label className="text-sm font-medium">Quantos irmãos?</Label>
                  <Input
                    value={String(formData.irmaos || '')}
                    onChange={(e) => updateField('irmaos', e.target.value)}
                    placeholder="Número de irmãos"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Doenças dos irmãos</Label>
                  <Textarea
                    value={String(formData.irmaosDoencas || '')}
                    onChange={(e) => updateField('irmaosDoencas', e.target.value)}
                    placeholder="Liste as doenças dos irmãos"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              {/* Filhos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Filhos</h3>
                <div>
                  <Label className="text-sm font-medium">Quantos filhos?</Label>
                  <Input
                    value={String(formData.filhos || '')}
                    onChange={(e) => updateField('filhos', e.target.value)}
                    placeholder="Número de filhos"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Doenças dos filhos</Label>
                  <Textarea
                    value={String(formData.filhosDoencas || '')}
                    onChange={(e) => updateField('filhosDoencas', e.target.value)}
                    placeholder="Liste as doenças dos filhos"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              {/* Outros Parentes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Outros Parentes</h3>
                <RadioGroup
                  value={String(formData.outrosParentes || '')}
                  onValueChange={(value) => updateField('outrosParentes', value)}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outros-parentes-nao" />
                    <Label htmlFor="outros-parentes-nao">Não há outras doenças relevantes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outros-parentes-sim" />
                    <Label htmlFor="outros-parentes-sim">Sim, há outras doenças</Label>
                  </div>
                </RadioGroup>
                
                {formData.outrosParentes === 'Sim' && (
                  <div>
                    <Label className="text-sm font-medium">Detalhes sobre outros parentes</Label>
                    <Textarea
                      value={String(formData.outrosParentesDetalhes || '')}
                      onChange={(e) => updateField('outrosParentesDetalhes', e.target.value)}
                      placeholder="Descreva doenças de outros parentes (tios, primos, etc.)"
                      className="mt-1 bg-blue-50"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 13. HÁBITOS PESSOAIS - TABAGISMO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Hábitos Pessoais - Tabagismo</h2>
              
              <div>
                <Label className="text-sm font-medium">Fuma atualmente?</Label>
                <RadioGroup
                  value={String(formData.fumaAtualmente || '')}
                  onValueChange={(value) => updateField('fumaAtualmente', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="fuma-nao" />
                    <Label htmlFor="fuma-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="fuma-sim" />
                    <Label htmlFor="fuma-sim">Sim</Label>
                  </div>
                </RadioGroup>
                
                {formData.fumaAtualmente === 'Sim' && (
                  <div className="mt-4 space-y-4 bg-red-50 p-4 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Tipo de fumo</Label>
                      <RadioGroup
                        value={String(formData.tipoFumo || '')}
                        onValueChange={(value) => updateField('tipoFumo', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Cigarro" id="tipo-cigarro" />
                          <Label htmlFor="tipo-cigarro">Cigarro</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Charuto" id="tipo-charuto" />
                          <Label htmlFor="tipo-charuto">Charuto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Cachimbo" id="tipo-cachimbo" />
                          <Label htmlFor="tipo-cachimbo">Cachimbo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Outros" id="tipo-outros" />
                          <Label htmlFor="tipo-outros">Outros</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Idade que começou a fumar</Label>
                        <Input
                          type="number"
                          value={formData.idadeInicioFumo || ''}
                          onChange={(e) => updateField('idadeInicioFumo', parseInt(e.target.value) || 0)}
                          placeholder="Idade"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Cigarros por dia</Label>
                        <Input
                          type="number"
                          value={formData.cigarrosPorDia || ''}
                          onChange={(e) => updateField('cigarrosPorDia', parseInt(e.target.value) || 0)}
                          placeholder="Número de cigarros"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {formData.cigarrosPorDia && formData.idadeInicioFumo && formData.idade && (
                      <div className="p-3 bg-red-100 rounded-md">
                        <Label className="text-sm font-medium">Carga Tabágica</Label>
                        <div className="text-lg font-semibold text-red-700">
                          {calculateCargaTabagica()} anos-maço
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formData.fumaAtualmente === 'Não' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Já fumou anteriormente?</Label>
                      <RadioGroup
                        value={String(formData.jaFumou || '')}
                        onValueChange={(value) => updateField('jaFumou', value)}
                        className="mt-2 flex flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id="ja-fumou-nao" />
                          <Label htmlFor="ja-fumou-nao">Nunca fumei</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id="ja-fumou-sim" />
                          <Label htmlFor="ja-fumou-sim">Já fumei</Label>
                        </div>
                      </RadioGroup>

                      {formData.jaFumou === 'Sim' && (
                        <div className="mt-4 space-y-4 bg-yellow-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Idade que começou</Label>
                              <Input
                                type="number"
                                value={formData.idadeInicioFumo || ''}
                                onChange={(e) => updateField('idadeInicioFumo', parseInt(e.target.value) || 0)}
                                placeholder="Idade"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Idade que parou</Label>
                              <Input
                                type="number"
                                value={formData.idadeCessouFumo || ''}
                                onChange={(e) => updateField('idadeCessouFumo', parseInt(e.target.value) || 0)}
                                placeholder="Idade"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Cigarros por dia</Label>
                              <Input
                                type="number"
                                value={formData.cigarrosPorDia || ''}
                                onChange={(e) => updateField('cigarrosPorDia', parseInt(e.target.value) || 0)}
                                placeholder="Número"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Cessou recentemente (últimos 5 anos)?</Label>
                            <RadioGroup
                              value={String(formData.cessouRecentemente || '')}
                              onValueChange={(value) => updateField('cessouRecentemente', value)}
                              className="mt-2 flex flex-row gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Não" id="cessou-nao" />
                                <Label htmlFor="cessou-nao">Não</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Sim" id="cessou-sim" />
                                <Label htmlFor="cessou-sim">Sim</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {formData.cigarrosPorDia && formData.idadeInicioFumo && formData.idadeCessouFumo && (
                            <div className="p-3 bg-yellow-100 rounded-md">
                              <Label className="text-sm font-medium">Carga Tabágica</Label>
                              <div className="text-lg font-semibold text-yellow-700">
                                {calculateCargaTabagica()} anos-maço
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Tabagismo passivo (convive com fumantes)</Label>
                <RadioGroup
                  value={String(formData.tabagismoPassivo || '')}
                  onValueChange={(value) => updateField('tabagismoPassivo', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="passivo-nao" />
                    <Label htmlFor="passivo-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="passivo-sim" />
                    <Label htmlFor="passivo-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.tabagismoPassivo === 'Sim' && (
                  <Textarea
                    value={String(formData.tabagismoPassivoDetalhes || '')}
                    onChange={(e) => updateField('tabagismoPassivoDetalhes', e.target.value)}
                    placeholder="Descreva a situação de tabagismo passivo"
                    className="bg-gray-50 mt-2"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* 14. ÁLCOOL */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Consumo de Álcool</h2>
              
              <div>
                <Label className="text-sm font-medium">Consome álcool atualmente?</Label>
                <RadioGroup
                  value={String(formData.consumeAlcool || '')}
                  onValueChange={(value) => updateField('consumeAlcool', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="alcool-nao" />
                    <Label htmlFor="alcool-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="alcool-sim" />
                    <Label htmlFor="alcool-sim">Sim</Label>
                  </div>
                </RadioGroup>

                {formData.consumeAlcool === 'Não' && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Já consumiu álcool anteriormente?</Label>
                    <RadioGroup
                      value={String(formData.jaConsumiuAlcool || '')}
                      onValueChange={(value) => updateField('jaConsumiuAlcool', value)}
                      className="mt-2 flex flex-row gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Não" id="ja-consumiu-nao" />
                        <Label htmlFor="ja-consumiu-nao">Nunca consumi</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sim" id="ja-consumiu-sim" />
                        <Label htmlFor="ja-consumiu-sim">Já consumi</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(formData.consumeAlcool === 'Sim' || formData.jaConsumiuAlcool === 'Sim') && (
                  <div className="mt-4 space-y-4 bg-amber-50 p-4 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Tipos de bebida que consome/consumia</Label>
                      <div className="mt-2 space-y-2">
                        {['Cerveja', 'Vinho', 'Destilados (cachaça, whisky, vodka)', 'Licores'].map((tipo) => (
                          <div key={tipo} className="flex items-center space-x-2">
                            <Checkbox
                              id={`alcool-${tipo}`}
                              checked={formData.tiposAlcool?.includes(tipo) || false}
                              onCheckedChange={(checked) => {
                                const currentTypes = formData.tiposAlcool || [];
                                const newTypes = checked
                                  ? [...currentTypes, tipo]
                                  : currentTypes.filter(t => t !== tipo);
                                updateField('tiposAlcool', newTypes);
                              }}
                            />
                            <Label htmlFor={`alcool-${tipo}`} className="text-sm">{tipo}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Classificação do consumo</Label>
                      <RadioGroup
                        value={String(formData.classificacaoConsumo || '')}
                        onValueChange={(value) => updateField('classificacaoConsumo', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Social/Ocasional" id="consumo-social" />
                          <Label htmlFor="consumo-social">Social/Ocasional</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Moderado" id="consumo-moderado" />
                          <Label htmlFor="consumo-moderado">Moderado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Excessivo" id="consumo-excessivo" />
                          <Label htmlFor="consumo-excessivo">Excessivo</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Observações sobre o consumo</Label>
                      <Textarea
                        value={String(formData.consumoObservacoes || '')}
                        onChange={(e) => updateField('consumoObservacoes', e.target.value)}
                        placeholder="Frequência, quantidade, situações de consumo"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 15. ATIVIDADE FÍSICA */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Atividade Física</h2>
              
              <div>
                <Label className="text-sm font-medium">Pratica atividade física atualmente?</Label>
                <RadioGroup
                  value={String(formData.atividadeFisica || '')}
                  onValueChange={(value) => updateField('atividadeFisica', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="atividade-nao" />
                    <Label htmlFor="atividade-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="atividade-sim" />
                    <Label htmlFor="atividade-sim">Sim</Label>
                  </div>
                </RadioGroup>

                {formData.atividadeFisica === 'Não' && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Já praticou atividade física anteriormente?</Label>
                    <RadioGroup
                      value={String(formData.atividadeFisicaPrevia || '')}
                      onValueChange={(value) => updateField('atividadeFisicaPrevia', value)}
                      className="mt-2 flex flex-row gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Não" id="atividade-previa-nao" />
                        <Label htmlFor="atividade-previa-nao">Nunca pratiquei</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sim" id="atividade-previa-sim" />
                        <Label htmlFor="atividade-previa-sim">Já pratiquei</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(formData.atividadeFisica === 'Sim' || formData.atividadeFisicaPrevia === 'Sim') && (
                  <div className="mt-4 space-y-4 bg-green-50 p-4 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Frequência semanal</Label>
                      <RadioGroup
                        value={String(formData.frequenciaSemanal || '')}
                        onValueChange={(value) => updateField('frequenciaSemanal', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1-2 vezes" id="freq-1-2" />
                          <Label htmlFor="freq-1-2">1-2 vezes por semana</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3-4 vezes" id="freq-3-4" />
                          <Label htmlFor="freq-3-4">3-4 vezes por semana</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5 ou mais" id="freq-5-mais" />
                          <Label htmlFor="freq-5-mais">5 ou mais vezes por semana</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tipo de atividade</Label>
                      <Textarea
                        value={String(formData.tipoAtividade || '')}
                        onChange={(e) => updateField('tipoAtividade', e.target.value)}
                        placeholder="Descreva as atividades (caminhada, corrida, musculação, natação, etc.)"
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tempo total semanal</Label>
                      <RadioGroup
                        value={String(formData.tempoTotalSemanal || '')}
                        onValueChange={(value) => updateField('tempoTotalSemanal', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Menos de 150 min" id="tempo-150" />
                          <Label htmlFor="tempo-150">Menos de 150 minutos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="150-300 min" id="tempo-150-300" />
                          <Label htmlFor="tempo-150-300">150-300 minutos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Mais de 300 min" id="tempo-300" />
                          <Label htmlFor="tempo-300">Mais de 300 minutos</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 16. ALIMENTAÇÃO */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Alimentação</h2>
              
              <div>
                <Label className="text-sm font-medium">Tipo de alimentação</Label>
                <RadioGroup
                  value={String(formData.tipoAlimentacao || '')}
                  onValueChange={(value) => updateField('tipoAlimentacao', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Onívora" id="alimentacao-onivora" />
                    <Label htmlFor="alimentacao-onivora">Onívora (come de tudo)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Vegetariana" id="alimentacao-vegetariana" />
                    <Label htmlFor="alimentacao-vegetariana">Vegetariana</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Vegana" id="alimentacao-vegana" />
                    <Label htmlFor="alimentacao-vegana">Vegana</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Outras restrições" id="alimentacao-outras" />
                    <Label htmlFor="alimentacao-outras">Outras restrições</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* 17. VACINAÇÕES */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Vacinações</h2>
              
              <div>
                <Label className="text-sm font-medium">Vacina da Influenza (Gripe)</Label>
                <RadioGroup
                  value={String(formData.influenza || '')}
                  onValueChange={(value) => updateField('influenza', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="influenza-nao" />
                    <Label htmlFor="influenza-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="influenza-sim" />
                    <Label htmlFor="influenza-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.influenza === 'Sim' && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium">Ano da última vacina</Label>
                    <Input
                      type="number"
                      value={formData.influenzaAno || ''}
                      onChange={(e) => updateField('influenzaAno', parseInt(e.target.value) || 0)}
                      placeholder="Ano"
                      className="mt-1 max-w-32"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Vacina COVID-19</Label>
                <RadioGroup
                  value={String(formData.covid || '')}
                  onValueChange={(value) => updateField('covid', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="covid-nao" />
                    <Label htmlFor="covid-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="covid-sim" />
                    <Label htmlFor="covid-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.covid === 'Sim' && (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Ano da última dose</Label>
                      <Input
                        type="number"
                        value={formData.covidAno || ''}
                        onChange={(e) => updateField('covidAno', parseInt(e.target.value) || 0)}
                        placeholder="Ano"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Quantas doses?</Label>
                      <RadioGroup
                        value={String(formData.covidDoses || '')}
                        onValueChange={(value) => updateField('covidDoses', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="covid-1" />
                          <Label htmlFor="covid-1">1 dose</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="covid-2" />
                          <Label htmlFor="covid-2">2 doses</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3 ou mais" id="covid-3" />
                          <Label htmlFor="covid-3">3 ou mais doses</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Vacina Pneumocócica</Label>
                <RadioGroup
                  value={String(formData.pneumococcica || '')}
                  onValueChange={(value) => updateField('pneumococcica', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="pneumococcica-nao" />
                    <Label htmlFor="pneumococcica-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="pneumococcica-sim" />
                    <Label htmlFor="pneumococcica-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.pneumococcica === 'Sim' && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium">Ano da vacina</Label>
                    <Input
                      type="number"
                      value={formData.pneumococcicaAno || ''}
                      onChange={(e) => updateField('pneumococcicaAno', parseInt(e.target.value) || 0)}
                      placeholder="Ano"
                      className="mt-1 max-w-32"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Outras vacinas relevantes</Label>
                <div className="mt-2 space-y-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Input
                      key={i}
                      value={formData.outrasVacinas?.[i] || ''}
                      onChange={(e) => {
                        const newVacinas = [...(formData.outrasVacinas || [])];
                        newVacinas[i] = e.target.value;
                        updateField('outrasVacinas', newVacinas);
                      }}
                      placeholder={`Outra vacina ${i + 1} (nome e ano)`}
                      className="mt-1"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 18. RASTREAMENTOS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Exames de Rastreamento</h2>
              
              <div>
                <Label className="text-sm font-medium">Colonoscopia</Label>
                <RadioGroup
                  value={String(formData.colonoscopia || '')}
                  onValueChange={(value) => updateField('colonoscopia', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="colonoscopia-nao" />
                    <Label htmlFor="colonoscopia-nao">Nunca fiz</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="colonoscopia-sim" />
                    <Label htmlFor="colonoscopia-sim">Já fiz</Label>
                  </div>
                </RadioGroup>
                {formData.colonoscopia === 'Sim' && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium">Ano do último exame</Label>
                    <Input
                      type="number"
                      value={formData.colonoscopiaAno || ''}
                      onChange={(e) => updateField('colonoscopiaAno', parseInt(e.target.value) || 0)}
                      placeholder="Ano"
                      className="mt-1 max-w-32"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* DECLARAÇÃO FINAL */}
            <div className="space-y-6 pt-8 border-t-2 border-blue-200">
              <h2 className="text-xl font-bold text-blue-800">Declaração de Veracidade</h2>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaracao"
                    checked={formData.declaracao || false}
                    onCheckedChange={(checked) => updateField('declaracao', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="declaracao" className="text-sm leading-relaxed text-blue-900">
                    <strong>Declaro que todas as informações fornecidas neste formulário são verdadeiras e completas.</strong>
                    <br /><br />
                    Entendo que essas informações são essenciais para uma avaliação médica adequada e autorizo 
                    o uso dessas informações para fins médicos, diagnósticos e de tratamento.
                    <br /><br />
                    Comprometo-me a informar qualquer alteração significativa em meu estado de saúde.
                    <span className="text-red-600 ml-2 font-bold">*</span>
                  </Label>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mt-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Baixar PDF
              </Button>
              <Button
                onClick={handleSubmitAndEmail}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Send className="mr-2 h-5 w-5" />
                Enviar por Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
