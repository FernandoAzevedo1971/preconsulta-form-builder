import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart } from 'lucide-react';

interface CardiovascularSectionProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  updateArrayField?: (field: string, index: number, value: string) => void;
  calculateAge?: (birthDate: string) => number;
  calculateEpworthTotal?: () => number;
  calculateCargaTabagica?: () => number;
}

const ConditionalTextarea: React.FC<{
  condition: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ condition, label, value, onChange, placeholder }) => {
  if (!condition) return null;
  
  return (
    <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white"
        rows={3}
      />
    </div>
  );
};

export const CardiovascularSection: React.FC<CardiovascularSectionProps> = ({
  formData,
  updateField,
}) => {
  const cardiovascularConditions = [
    { 
      key: 'pressaoAlta', 
      label: 'Pressão alta',
      observacoes: 'pressaoAltaObservacoes',
      placeholder: 'Descreva detalhes sobre pressão alta'
    },
    { 
      key: 'colesterolAlto', 
      label: 'Colesterol alto',
      observacoes: 'colesterolAltoObservacoes',
      placeholder: 'Descreva detalhes sobre colesterol alto'
    },
    { 
      key: 'arritmias', 
      label: 'Arritmias',
      observacoes: 'arritmiasObservacoes',
      placeholder: 'Descreva detalhes sobre arritmias'
    },
    { 
      key: 'outrosCardiacos', 
      label: 'Outros problemas cardíacos',
      observacoes: 'outrosCardiacosObservacoes',
      placeholder: 'Descreva outros problemas cardíacos'
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Sistema Cardiovascular</h3>
          </div>
          <p className="text-red-800 text-sm">
            ** Se a opção for "NÃO", é opcional deixar a resposta em branco
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {cardiovascularConditions.map((condition) => (
          <Card key={condition.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900">
                    {condition.label}
                  </Label>
                  <RadioGroup
                    value={formData[condition.key] || ''}
                    onValueChange={(value) => updateField(condition.key, value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Não" id={`${condition.key}-nao`} />
                        <Label htmlFor={`${condition.key}-nao`} className="text-sm">
                          Não
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sim" id={`${condition.key}-sim`} />
                        <Label htmlFor={`${condition.key}-sim`} className="text-sm">
                          Sim
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <ConditionalTextarea
                  condition={formData[condition.key] === 'Sim'}
                  label={`Observações sobre ${condition.label}`}
                  value={formData[condition.observacoes] || ''}
                  onChange={(value) => updateField(condition.observacoes, value)}
                  placeholder={condition.placeholder}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};