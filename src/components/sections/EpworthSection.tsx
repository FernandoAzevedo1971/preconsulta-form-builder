import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Calculator } from 'lucide-react';

interface EpworthSectionProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  updateArrayField?: (field: string, index: number, value: string) => void;
  calculateAge?: (birthDate: string) => number;
  calculateEpworthTotal?: () => number;
  calculateCargaTabagica?: () => number;
}

const epworthQuestions = [
  { key: 'epworthLendo', label: 'Sentado e lendo' },
  { key: 'epworthTV', label: 'Assistindo TV' },
  { key: 'epworthPublico', label: 'Sentado, quieto, em um lugar público (por exemplo, em um teatro, reunião ou palestra)' },
  { key: 'epworthTransporte', label: 'Andando de carro por uma hora sem parar, como passageiro' },
  { key: 'epworthDescansando', label: 'Descansando na parte da tarde, quando as circunstâncias permitem' },
  { key: 'epworthConversando', label: 'Sentado conversando com alguém' },
  { key: 'epworthAposRefeicao', label: 'Sentado quieto após o almoço sem bebida de álcool' },
  { key: 'epworthDirigindo', label: 'Em um carro parado no trânsito por alguns minutos' },
];

const epworthOptions = [
  { value: 0, label: 'Nunca cochilaria (0)' },
  { value: 1, label: 'Pequena probabilidade de cochilar (1)' },
  { value: 2, label: 'Probabilidade média de cochilar (2)' },
  { value: 3, label: 'Grande probabilidade de cochilar (3)' },
];

export const EpworthSection: React.FC<EpworthSectionProps> = ({
  formData,
  updateField,
  calculateEpworthTotal,
}) => {
  // Recalculate total whenever any Epworth field changes
  useEffect(() => {
    if (calculateEpworthTotal) {
      calculateEpworthTotal();
    }
  }, [
    formData.epworthLendo,
    formData.epworthTV,
    formData.epworthPublico,
    formData.epworthTransporte,
    formData.epworthDescansando,
    formData.epworthConversando,
    formData.epworthAposRefeicao,
    formData.epworthDirigindo,
    calculateEpworthTotal
  ]);

  const handleScoreChange = (field: string, value: number) => {
    updateField(field, value);
    // Trigger recalculation after state update
    setTimeout(() => {
      if (calculateEpworthTotal) {
        calculateEpworthTotal();
      }
    }, 0);
  };
  
  const total = formData.epworthTotal || 0;
  
  const getScoreInterpretation = (score: number) => {
    if (score <= 5) return { text: 'Normal', color: 'text-green-600' };
    if (score <= 10) return { text: 'Sonolência leve', color: 'text-yellow-600' };
    if (score <= 15) return { text: 'Sonolência moderada', color: 'text-orange-600' };
    return { text: 'Sonolência severa', color: 'text-red-600' };
  };

  const interpretation = getScoreInterpretation(total);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Escala de Sonolência de Epworth</h3>
          </div>
           <p className="text-purple-800 text-sm mb-3">
             Qual a probabilidade de você cochilar ou dormir, e não apenas se sentir cansado, nas seguintes situações? 
             Considere o modo de vida que você tem levado recentemente. Mesmo que você não tenha feito algumas destas 
             coisas recentemente, tente imaginar como elas o afetariam.
           </p>
           <p className="text-purple-800 text-sm font-medium">
             Escolha o número mais apropriado para responder cada questão:
           </p>
        </CardContent>
      </Card>

      {/* Tabela de Perguntas */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                 <tr className="border-b">
                   <th className="text-left p-3 font-medium">Situação</th>
                   <th className="text-center p-3 font-medium min-w-[60px]">0</th>
                   <th className="text-center p-3 font-medium min-w-[60px]">1</th>
                   <th className="text-center p-3 font-medium min-w-[60px]">2</th>
                   <th className="text-center p-3 font-medium min-w-[60px]">3</th>
                 </tr>
               </thead>
               <tbody>
                 {epworthQuestions.map((question) => (
                   <tr key={question.key} className="border-b hover:bg-gray-50">
                     <td className="p-3">
                       <Label className="text-sm font-medium">
                         {question.label}
                       </Label>
                     </td>
                     <RadioGroup
                       value={formData[question.key] !== null ? formData[question.key].toString() : ''}
                       onValueChange={(value) => handleScoreChange(question.key, parseInt(value))}
                       className="contents"
                     >
                       {epworthOptions.map((option) => (
                         <td key={option.value} className="text-center p-3">
                           <RadioGroupItem 
                             value={option.value.toString()} 
                             id={`${question.key}-${option.value}`}
                             className="mx-auto"
                           />
                         </td>
                       ))}
                     </RadioGroup>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Resultado da Escala</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Pontuação Total</p>
              <p className="text-3xl font-bold text-blue-600">{total}</p>
              <p className="text-sm text-gray-500">(máximo 24 pontos)</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Interpretação</p>
              <p className={`text-lg font-semibold ${interpretation.color}`}>
                {interpretation.text}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {total <= 5 ? 'Dentro do normal' : 
                 total <= 10 ? 'Atenção recomendada' : 
                 'Consulte um especialista'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
