import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send } from 'lucide-react';
import { useMedicalForm } from '@/hooks/useMedicalForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { LGPDSection } from './sections/LGPDSection';
import { IdentificationSection } from './sections/IdentificationSection';
import { RespiratorySection } from './sections/RespiratorySection';
import { SleepSection } from './sections/SleepSection';
import { EpworthSection } from './sections/EpworthSection';
import { CardiovascularSection } from './sections/CardiovascularSection';
import { 
  EndocrineSection,
  OtherSystemsSection,
  AllergiesSection,
  MedicationsSection,
  SurgeriesSection,
  FamilyHistorySection,
  PersonalHabitsSection,
  VaccinationsSection,
  ScreeningSection,
  DeclarationSection
} from './sections';

const sections = [
  { id: 'lgpd', title: 'Termo LGPD', component: LGPDSection },
  { id: 'identification', title: 'Identificação', component: IdentificationSection },
  { id: 'respiratory', title: 'Respiratório', component: RespiratorySection },
  { id: 'sleep', title: 'Sono', component: SleepSection },
  { id: 'epworth', title: 'Escala Epworth', component: EpworthSection },
  { id: 'cardiovascular', title: 'Cardiovascular', component: CardiovascularSection },
  { id: 'endocrine', title: 'Endócrino', component: EndocrineSection },
  { id: 'other-systems', title: 'Outros Sistemas', component: OtherSystemsSection },
  { id: 'allergies', title: 'Alergias', component: AllergiesSection },
  { id: 'medications', title: 'Medicações', component: MedicationsSection },
  { id: 'surgeries', title: 'Cirurgias', component: SurgeriesSection },
  { id: 'family-history', title: 'História Familiar', component: FamilyHistorySection },
  { id: 'personal-habits', title: 'Hábitos Pessoais', component: PersonalHabitsSection },
  { id: 'vaccinations', title: 'Vacinações', component: VaccinationsSection },
  { id: 'screening', title: 'Rastreamentos', component: ScreeningSection },
  { id: 'declaration', title: 'Declaração', component: DeclarationSection },
];

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
          form_data: formData
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
        <div ref={formRef} className="space-y-6">
          {sections.map((section, index) => {
            const SectionComponent = section.component;
            return (
              <Card key={section.id} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SectionComponent
                    formData={formData}
                    updateField={updateField}
                    updateArrayField={updateArrayField}
                    calculateAge={calculateAge}
                    calculateEpworthTotal={calculateEpworthTotal}
                    calculateCargaTabagica={calculateCargaTabagica}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

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