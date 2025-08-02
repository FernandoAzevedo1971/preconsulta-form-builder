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
          <CardContent className="p-8 space-y-8">
            {/* LGPD */}
            <div className="border-b pb-8">
              <div className="flex items-start gap-3 mb-6">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Lei Geral de Proteção de Dados Pessoais (LGPD)
                  </h3>
                  <p className="text-blue-800 leading-relaxed">
                    Este formulário está em conformidade com a Lei Geral de Proteção de Dados Pessoais 
                    (Lei nº 13.709/2018). As informações coletadas serão tratadas de forma ética e responsável, 
                    observando os princípios de transparência, segurança e respeito à privacidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Identificação */}
            <div className="border-b pb-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Informações Pessoais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
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
            </div>

            {/* Sistema Respiratório */}
            <div className="border-b pb-8">
              <div className="flex items-center gap-2 mb-6">
                <Wind className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Sistema Respiratório</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'asma', label: 'Asma / Bronquite', observacoes: 'asmaObservacoes' },
                  { key: 'rinite', label: 'Rinite', observacoes: 'riniteObservacoes' },
                  { key: 'sinusites', label: 'Sinusites', observacoes: 'sinusitesObservacoes' },
                  { key: 'enfisema', label: 'Enfisema / DPOC', observacoes: 'enfisemaObservacoes' },
                  { key: 'pneumonias', label: 'Pneumonias prévias', observacoes: 'pneumoniasObservacoes' },
                  { key: 'tuberculose', label: 'Tuberculose', observacoes: 'tuberculoseObservacoes' },
                ].map((condition) => (
                  <div key={condition.key} className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{condition.label}</Label>
                      <RadioGroup
                        value={String(formData[condition.key as keyof typeof formData] || '')}
                        onValueChange={(value) => updateField(condition.key as keyof typeof formData, value)}
                        className="mt-2 flex flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id={`${condition.key}-nao`} />
                          <Label htmlFor={`${condition.key}-nao`}>Não</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id={`${condition.key}-sim`} />
                          <Label htmlFor={`${condition.key}-sim`}>Sim</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {formData[condition.key as keyof typeof formData] === 'Sim' && (
                      <Textarea
                        value={String(formData[condition.observacoes as keyof typeof formData] || '')}
                        onChange={(e) => updateField(condition.observacoes as keyof typeof formData, e.target.value)}
                        placeholder={`Descreva detalhes sobre ${condition.label.toLowerCase()}`}
                        className="bg-blue-50"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Distúrbios do Sono */}
            <div className="border-b pb-8">
              <div className="flex items-center gap-2 mb-6">
                <Moon className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Distúrbios do Sono</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'roncos', label: 'Roncos / Apneia do Sono', observacoes: 'roncosObservacoes' },
                  { key: 'insonia', label: 'Insônia', observacoes: 'insoniaObservacoes' },
                  { key: 'sonolienciaDiurna', label: 'Muito sono durante o dia', observacoes: 'sonolienciaDiurnaObservacoes' },
                  { key: 'outrosProblemasSono', label: 'Outros problemas no sono', observacoes: 'outrosProblemasSonoObservacoes' },
                ].map((condition) => (
                  <div key={condition.key} className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{condition.label}</Label>
                      <RadioGroup
                        value={formData[condition.key as keyof typeof formData] as string || ''}
                        onValueChange={(value) => updateField(condition.key as keyof typeof formData, value)}
                        className="mt-2 flex flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id={`${condition.key}-nao`} />
                          <Label htmlFor={`${condition.key}-nao`}>Não</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id={`${condition.key}-sim`} />
                          <Label htmlFor={`${condition.key}-sim`}>Sim</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {formData[condition.key as keyof typeof formData] === 'Sim' && (
                      <Textarea
                        value={String(formData[condition.observacoes as keyof typeof formData] || '')}
                        onChange={(e) => updateField(condition.observacoes as keyof typeof formData, e.target.value)}
                        placeholder={`Descreva detalhes sobre ${condition.label.toLowerCase()}`}
                        className="bg-purple-50"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Campos específicos para roncos */}
              {formData.roncos === 'Sim' && (
                <div className="mt-6 p-4 bg-purple-50 rounded-md space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-purple-900">Roncos são frequentes?</Label>
                    <RadioGroup
                      value={formData.roncosFrequencia || ''}
                      onValueChange={(value) => updateField('roncosFrequencia', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Todos os dias ou Quase todos os dias" id="frequentes" />
                        <Label htmlFor="frequentes">Todos os dias ou Quase todos os dias</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="< 3x na semana" id="pouco-frequentes" />
                        <Label htmlFor="pouco-frequentes">&lt; 3x na semana</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Esporadicos" id="esporadicos" />
                        <Label htmlFor="esporadicos">Esporádicos</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-purple-900">
                      Intensidade do Ronco (0 a 10): {formData.roncosIntensidade || 0}
                    </Label>
                    <Slider
                      value={[formData.roncosIntensidade || 0]}
                      onValueChange={(value) => updateField('roncosIntensidade', value[0])}
                      max={10}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Escala de Epworth */}
            <div className="border-b pb-8">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Escala de Sonolência de Epworth</h3>
              </div>
              
              <p className="text-purple-800 text-sm mb-6">
                Na últimas 4 semanas, qual possibilidade de você cochilar ou adormecer 
                (mesmo que de modo muito breve) nas seguintes situações:
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

              <div className="mt-6 p-4 bg-green-50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Resultado</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  Total: {calculateEpworthTotal()} pontos
                </p>
              </div>
            </div>

            {/* Sistema Cardiovascular */}
            <div className="border-b pb-8">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Sistema Cardiovascular</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'pressaoAlta', label: 'Pressão alta', observacoes: 'pressaoAltaObservacoes' },
                  { key: 'colesterolAlto', label: 'Colesterol alto', observacoes: 'colesterolAltoObservacoes' },
                  { key: 'arritmias', label: 'Arritmias', observacoes: 'arritmiasObservacoes' },
                  { key: 'outrosCardiacos', label: 'Outros problemas cardíacos', observacoes: 'outrosCardiacosObservacoes' },
                ].map((condition) => (
                  <div key={condition.key} className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{condition.label}</Label>
                      <RadioGroup
                        value={String(formData[condition.key as keyof typeof formData] || '')}
                        onValueChange={(value) => updateField(condition.key as keyof typeof formData, value)}
                        className="mt-2 flex flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id={`${condition.key}-nao`} />
                          <Label htmlFor={`${condition.key}-nao`}>Não</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id={`${condition.key}-sim`} />
                          <Label htmlFor={`${condition.key}-sim`}>Sim</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {formData[condition.key as keyof typeof formData] === 'Sim' && (
                      <Textarea
                        value={String(formData[condition.observacoes as keyof typeof formData] || '')}
                        onChange={(e) => updateField(condition.observacoes as keyof typeof formData, e.target.value)}
                        placeholder={`Descreva detalhes sobre ${condition.label.toLowerCase()}`}
                        className="bg-red-50"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Declaração */}
            <div>
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