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
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon, Shield, Info, User, Wind, Moon, Brain, Calculator, Heart } from 'lucide-react';
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
            pdfData: base64data.split(',')[1], // Remove o prefixo data:application/pdf;base64,
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
              Ficha de Pré-Avaliação Médica
            </CardTitle>
            <p className="text-blue-100 mt-2">
              Dados da história médica, complementares ao motivo da sua consulta
            </p>
          </CardHeader>
        </Card>

        {/* Formulário Contínuo */}
        <Card ref={formRef} className="shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* LGPD Info */}
              <div className="flex items-start gap-3 mb-6">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Lei Geral de Proteção de Dados Pessoais (LGPD)
                  </h3>
                  <p className="text-blue-800 leading-relaxed text-sm">
                    Este formulário está em conformidade com a Lei Geral de Proteção de Dados Pessoais 
                    (Lei nº 13.709/2018). As informações coletadas serão tratadas de forma ética e responsável.
                  </p>
                </div>
              </div>

              {/* Nome Completo */}
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

              {/* Data de Nascimento e Idade */}
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

              {/* Indicação */}
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

              {/* Quem Indicou */}
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

              {/* Sistema Respiratório - Asma */}
              <div>
                <Label className="text-sm font-medium">Asma / Bronquite</Label>
                <RadioGroup
                  value={String(formData.asma || '')}
                  onValueChange={(value) => updateField('asma', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="asma-nao" />
                    <Label htmlFor="asma-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="asma-sim" />
                    <Label htmlFor="asma-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.asma === 'Sim' && (
                  <Textarea
                    value={String(formData.asmaObservacoes || '')}
                    onChange={(e) => updateField('asmaObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre asma/bronquite"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Rinite */}
              <div>
                <Label className="text-sm font-medium">Rinite</Label>
                <RadioGroup
                  value={String(formData.rinite || '')}
                  onValueChange={(value) => updateField('rinite', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="rinite-nao" />
                    <Label htmlFor="rinite-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="rinite-sim" />
                    <Label htmlFor="rinite-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.rinite === 'Sim' && (
                  <Textarea
                    value={String(formData.riniteObservacoes || '')}
                    onChange={(e) => updateField('riniteObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre rinite"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Sinusites */}
              <div>
                <Label className="text-sm font-medium">Sinusites</Label>
                <RadioGroup
                  value={String(formData.sinusites || '')}
                  onValueChange={(value) => updateField('sinusites', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="sinusites-nao" />
                    <Label htmlFor="sinusites-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="sinusites-sim" />
                    <Label htmlFor="sinusites-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.sinusites === 'Sim' && (
                  <Textarea
                    value={String(formData.sinusitesObservacoes || '')}
                    onChange={(e) => updateField('sinusitesObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre sinusites"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Enfisema */}
              <div>
                <Label className="text-sm font-medium">Enfisema / DPOC</Label>
                <RadioGroup
                  value={String(formData.enfisema || '')}
                  onValueChange={(value) => updateField('enfisema', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="enfisema-nao" />
                    <Label htmlFor="enfisema-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="enfisema-sim" />
                    <Label htmlFor="enfisema-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.enfisema === 'Sim' && (
                  <Textarea
                    value={String(formData.enfisemaObservacoes || '')}
                    onChange={(e) => updateField('enfisemaObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre enfisema/DPOC"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Pneumonias */}
              <div>
                <Label className="text-sm font-medium">Pneumonias prévias</Label>
                <RadioGroup
                  value={String(formData.pneumonias || '')}
                  onValueChange={(value) => updateField('pneumonias', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="pneumonias-nao" />
                    <Label htmlFor="pneumonias-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="pneumonias-sim" />
                    <Label htmlFor="pneumonias-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.pneumonias === 'Sim' && (
                  <Textarea
                    value={String(formData.pneumoniasObservacoes || '')}
                    onChange={(e) => updateField('pneumoniasObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre pneumonias prévias"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Tuberculose */}
              <div>
                <Label className="text-sm font-medium">Tuberculose</Label>
                <RadioGroup
                  value={String(formData.tuberculose || '')}
                  onValueChange={(value) => updateField('tuberculose', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="tuberculose-nao" />
                    <Label htmlFor="tuberculose-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="tuberculose-sim" />
                    <Label htmlFor="tuberculose-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.tuberculose === 'Sim' && (
                  <Textarea
                    value={String(formData.tuberculoseObservacoes || '')}
                    onChange={(e) => updateField('tuberculoseObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre tuberculose"
                    className="bg-blue-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Roncos */}
              <div>
                <Label className="text-sm font-medium">Roncos / Apneia do Sono</Label>
                <RadioGroup
                  value={formData.roncos as string || ''}
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
                  <div className="space-y-3 mt-3">
                    <Textarea
                      value={String(formData.roncosObservacoes || '')}
                      onChange={(e) => updateField('roncosObservacoes', e.target.value)}
                      placeholder="Descreva detalhes sobre roncos/apneia"
                      className="bg-purple-50"
                      rows={2}
                    />
                    <div>
                      <Label className="text-sm font-medium text-purple-900">Roncos são frequentes?</Label>
                      <RadioGroup
                        value={formData.roncosFrequencia || ''}
                        onValueChange={(value) => updateField('roncosFrequencia', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Todas as noites" id="freq-todas" />
                          <Label htmlFor="freq-todas">Todas as noites</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Algumas vezes por semana" id="freq-algumas" />
                          <Label htmlFor="freq-algumas">Algumas vezes por semana</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Raramente" id="freq-raramente" />
                          <Label htmlFor="freq-raramente">Raramente</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              {/* Insônia */}
              <div>
                <Label className="text-sm font-medium">Insônia</Label>
                <RadioGroup
                  value={formData.insonia as string || ''}
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
                    className="bg-purple-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Sonolência Diurna */}
              <div>
                <Label className="text-sm font-medium">Muito sono durante o dia</Label>
                <RadioGroup
                  value={formData.sonolienciaDiurna as string || ''}
                  onValueChange={(value) => updateField('sonolienciaDiurna', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="sonoliencia-nao" />
                    <Label htmlFor="sonoliencia-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="sonoliencia-sim" />
                    <Label htmlFor="sonoliencia-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.sonolienciaDiurna === 'Sim' && (
                  <Textarea
                    value={String(formData.sonolienciaDiurnaObservacoes || '')}
                    onChange={(e) => updateField('sonolienciaDiurnaObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre sonolência diurna"
                    className="bg-purple-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Outros Problemas do Sono */}
              <div>
                <Label className="text-sm font-medium">Outros problemas no sono</Label>
                <RadioGroup
                  value={formData.outrosProblemasSono as string || ''}
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
                    placeholder="Descreva outros problemas no sono"
                    className="bg-purple-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Escala de Epworth */}
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Escala de Sonolência de Epworth</h4>
                <p className="text-purple-800 text-sm mb-4">
                  Nas últimas 4 semanas, qual possibilidade de você cochilar ou adormecer nas seguintes situações:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 border border-gray-300 font-medium">Situação</th>
                        <th className="text-center p-3 border border-gray-300 font-medium">Nenhuma(0)</th>
                        <th className="text-center p-3 border border-gray-300 font-medium">Pequena(1)</th>
                        <th className="text-center p-3 border border-gray-300 font-medium">Média(2)</th>
                        <th className="text-center p-3 border border-gray-300 font-medium">Alta(3)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'epworthLendo', label: '1. Sentado e LENDO' },
                        { key: 'epworthTV', label: '2. Sentado e vendo televisão' },
                        { key: 'epworthPublico', label: '3. Sentado em lugar público' },
                        { key: 'epworthTransporte', label: '4. Como passageiro de transporte' },
                        { key: 'epworthDescansando', label: '5. Deitado para descansar à tarde' },
                        { key: 'epworthConversando', label: '6. Sentado e conversando' },
                        { key: 'epworthAposRefeicao', label: '7. Sentado após refeição' },
                        { key: 'epworthDirigindo', label: '8. Dirigindo parado no trânsito' },
                      ].map((question) => (
                        <tr key={question.key} className="hover:bg-gray-50">
                          <td className="p-3 border border-gray-300">{question.label}</td>
                          {[0, 1, 2, 3].map((value) => (
                            <td key={value} className="text-center p-3 border border-gray-300">
                              <RadioGroup
                                value={formData[question.key]?.toString() || ''}
                                onValueChange={(val) => updateField(question.key as keyof typeof formData, parseInt(val))}
                              >
                                <RadioGroupItem 
                                  value={value.toString()} 
                                  id={`${question.key}-${value}`}
                                />
                              </RadioGroup>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-lg font-bold text-blue-600">
                    Total Epworth: {calculateEpworthTotal()} pontos
                  </p>
                </div>
              </div>

              {/* Pressão Alta */}
              <div>
                <Label className="text-sm font-medium">Pressão alta</Label>
                <RadioGroup
                  value={String(formData.pressaoAlta || '')}
                  onValueChange={(value) => updateField('pressaoAlta', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="pressao-nao" />
                    <Label htmlFor="pressao-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="pressao-sim" />
                    <Label htmlFor="pressao-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.pressaoAlta === 'Sim' && (
                  <Textarea
                    value={String(formData.pressaoAltaObservacoes || '')}
                    onChange={(e) => updateField('pressaoAltaObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre pressão alta"
                    className="bg-red-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Colesterol Alto */}
              <div>
                <Label className="text-sm font-medium">Colesterol alto</Label>
                <RadioGroup
                  value={String(formData.colesterolAlto || '')}
                  onValueChange={(value) => updateField('colesterolAlto', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="colesterol-nao" />
                    <Label htmlFor="colesterol-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="colesterol-sim" />
                    <Label htmlFor="colesterol-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.colesterolAlto === 'Sim' && (
                  <Textarea
                    value={String(formData.colesterolAltoObservacoes || '')}
                    onChange={(e) => updateField('colesterolAltoObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre colesterol alto"
                    className="bg-red-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Arritmias */}
              <div>
                <Label className="text-sm font-medium">Arritmias</Label>
                <RadioGroup
                  value={String(formData.arritmias || '')}
                  onValueChange={(value) => updateField('arritmias', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="arritmias-nao" />
                    <Label htmlFor="arritmias-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="arritmias-sim" />
                    <Label htmlFor="arritmias-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.arritmias === 'Sim' && (
                  <Textarea
                    value={String(formData.arritmiasObservacoes || '')}
                    onChange={(e) => updateField('arritmiasObservacoes', e.target.value)}
                    placeholder="Descreva detalhes sobre arritmias"
                    className="bg-red-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Outros Problemas Cardíacos */}
              <div>
                <Label className="text-sm font-medium">Outros problemas cardíacos</Label>
                <RadioGroup
                  value={String(formData.outrosCardiacos || '')}
                  onValueChange={(value) => updateField('outrosCardiacos', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outros-cardiacos-nao" />
                    <Label htmlFor="outros-cardiacos-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outros-cardiacos-sim" />
                    <Label htmlFor="outros-cardiacos-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosCardiacos === 'Sim' && (
                  <Textarea
                    value={String(formData.outrosCardiacosObservacoes || '')}
                    onChange={(e) => updateField('outrosCardiacosObservacoes', e.target.value)}
                    placeholder="Descreva outros problemas cardíacos"
                    className="bg-red-50 mt-2"
                    rows={2}
                  />
                )}
              </div>

              {/* Declaração */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Declaração de Veracidade</h3>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaracao"
                    checked={formData.declaracao || false}
                    onCheckedChange={(checked) => updateField('declaracao', checked)}
                  />
                  <Label htmlFor="declaracao" className="text-sm leading-relaxed">
                    Declaro que todas as informações fornecidas neste formulário são verdadeiras e completas. 
                    Estou ciente de que informações falsas podem prejudicar meu atendimento médico e assumo 
                    total responsabilidade pela veracidade dos dados apresentados.
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Card className="mt-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
              
              <Button
                onClick={handleSubmitAndEmail}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                Enviar por Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};