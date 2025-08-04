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
            <div className="space-y-4">
              
              <p className="text-sm text-blue-800 leading-relaxed mb-6">
                Este formulário está em conformidade com a Lei Geral de Proteção de Dados Pessoais 
                (Lei nº 13.709/2018). As informações coletadas serão tratadas de forma ética e responsável.
              </p>

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

              <div>
                <Label className="text-sm font-medium">Tabagismo</Label>
                <RadioGroup
                  value={String((formData as any).tabagismo || '')}
                  onValueChange={(value) => updateField('tabagismo' as any, value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="tabagismo-nao" />
                    <Label htmlFor="tabagismo-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="tabagismo-sim" />
                    <Label htmlFor="tabagismo-sim">Sim</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Checkbox
                  id="declaracao"
                  checked={formData.declaracao || false}
                  onCheckedChange={(checked) => updateField('declaracao', checked)}
                />
                <Label htmlFor="declaracao" className="ml-2 text-sm">
                  Declaro que as informações fornecidas são verdadeiras e completas.
                </Label>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mt-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              <Button
                onClick={handleSubmitAndEmail}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar por Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
