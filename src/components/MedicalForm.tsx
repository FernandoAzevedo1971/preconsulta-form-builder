import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, FileText, Save } from 'lucide-react';
import { useMedicalForm } from '@/hooks/useMedicalForm';
import { toast } from '@/hooks/use-toast';

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

export const MedicalForm: React.FC = () => {
  const {
    formData,
    currentSection,
    updateField,
    updateArrayField,
    calculateAge,
    calculateEpworthTotal,
    calculateCargaTabagica,
    nextSection,
    prevSection,
    goToSection,
  } = useMedicalForm();

  const CurrentSectionComponent = sections[currentSection]?.component;
  const progress = ((currentSection + 1) / sections.length) * 100;

  const handleSubmit = () => {
    // Validação básica
    if (!formData.nomeCompleto) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome completo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.declaracao) {
      toast({
        title: "Erro", 
        description: "Por favor, aceite a declaração de veracidade das informações.",
        variant: "destructive",
      });
      return;
    }

    // Simular envio
    toast({
      title: "Sucesso!",
      description: "Ficha médica enviada com sucesso.",
    });
    
    console.log('Dados do formulário:', formData);
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

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Seção {currentSection + 1} de {sections.length}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progress)}% concluído
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
          </CardContent>
        </Card>

        {/* Current Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              {sections[currentSection]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {CurrentSectionComponent && (
              <CurrentSectionComponent
                formData={formData}
                updateField={updateField}
                updateArrayField={updateArrayField}
                calculateAge={calculateAge}
                calculateEpworthTotal={calculateEpworthTotal}
                calculateCargaTabagica={calculateCargaTabagica}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {currentSection === sections.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    Enviar Ficha
                  </Button>
                ) : (
                  <Button
                    onClick={nextSection}
                    className="flex items-center gap-2"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};