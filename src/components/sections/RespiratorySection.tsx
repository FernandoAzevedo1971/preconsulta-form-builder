import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wind } from 'lucide-react';

interface RespiratorySectionProps {
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
    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
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

export const RespiratorySection: React.FC<RespiratorySectionProps> = ({
  formData,
  updateField,
}) => {
  const respiratoryConditions = [
    { 
      key: 'asma', 
      label: 'Asma ou Bronquite Asmática ("alérgica")',
      observacoes: 'asmaObservacoes',
      placeholder: 'Descreva detalhes sobre asma ou bronquite'
    },
    { 
      key: 'rinite', 
      label: 'Rinite',
      observacoes: 'riniteObservacoes',
      placeholder: 'Descreva detalhes sobre rinite'
    },
    { 
      key: 'sinusites', 
      label: 'Sinusites',
      observacoes: 'sinusitesObservacoes',
      placeholder: 'Descreva detalhes sobre sinusites'
    },
    { 
      key: 'enfisema', 
      label: 'Enfisema',
      observacoes: 'enfisemaObservacoes',
      placeholder: 'Descreva detalhes sobre enfisema'
    },
    { 
      key: 'enfisemaBronquite', 
      label: 'Enfisema ou Bronquite Crônica (DPOC)',
      observacoes: 'enfisemaBronquiteObservacoes',
      placeholder: 'Descreva detalhes sobre enfisema ou bronquite crônica'
    },
    { 
      key: 'pneumonias', 
      label: 'Pneumonias prévias',
      observacoes: 'pneumoniasObservacoes',
      placeholder: 'Descreva detalhes sobre pneumonias anteriores'
    },
    { 
      key: 'tuberculose', 
      label: 'Tuberculose',
      observacoes: 'tuberculoseObservacoes',
      placeholder: 'Descreva detalhes sobre tuberculose'
    },
    { 
      key: 'outrasRespiratorias', 
      label: 'Outras doenças Respiratórias',
      observacoes: 'outrasRespiratoriasObservacoes',
      placeholder: 'Descreva outras doenças respiratórias'
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Histórico Respiratório</h3>
          </div>
          <p className="text-blue-800 text-sm">
            ** Se a opção for "NÃO", é opcional deixar a resposta em branco
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {respiratoryConditions.map((condition) => (
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
                  label={`Fale mais sobre ${condition.label}`}
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