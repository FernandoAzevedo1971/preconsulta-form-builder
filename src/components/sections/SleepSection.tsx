import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Moon } from 'lucide-react';
import { EpworthSection } from './EpworthSection';

interface SleepSectionProps {
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
    <div className="mt-3 p-3 bg-purple-50 rounded-md border border-purple-200">
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

export const SleepSection: React.FC<SleepSectionProps> = ({
  formData,
  updateField,
  calculateEpworthTotal,
}) => {
  const sleepConditions = [
    { 
      key: 'insonia', 
      label: 'Insônia',
      observacoes: 'insoniaObservacoes',
      placeholder: 'Descreva detalhes sobre insônia'
    },
    { 
      key: 'roncos', 
      label: 'Roncos ou Apneia do Sono',
      observacoes: 'roncosObservacoes',
      placeholder: 'Descreva detalhes sobre roncos ou apneia do sono'
    },
    { 
      key: 'sonolienciaDiurna', 
      label: 'Muito sono durante o dia',
      observacoes: 'sonolienciaDiurnaObservacoes',
      placeholder: 'Descreva detalhes sobre sonolência diurna'
    },
    { 
      key: 'outrosProblemasSono', 
      label: 'Outros problemas no sono',
      observacoes: 'outrosProblemasSonoObservacoes',
      placeholder: 'Descreva outros problemas relacionados ao sono'
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Distúrbios do Sono</h3>
          </div>
          <p className="text-purple-800 text-sm">
            ** Se a opção for "NÃO", é opcional deixar a resposta em branco
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {sleepConditions.map((condition) => (
          <React.Fragment key={condition.key}>
            <Card className="hover:shadow-md transition-shadow">
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

                  {/* Campos específicos para roncos */}
                  {condition.key === 'roncos' && formData[condition.key] === 'Sim' && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-md border border-purple-200">
                      <div>
                        <Label className="text-sm font-medium text-purple-900">
                          Roncos são frequentes?
                        </Label>
                        <RadioGroup
                          value={formData.roncosFrequencia || ''}
                          onValueChange={(value) => updateField('roncosFrequencia', value)}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Todos os dias ou Quase todos os dias" id="frequentes" />
                            <Label htmlFor="frequentes" className="text-sm">
                              Todos os dias ou Quase todos os dias
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="< 3x na semana" id="pouco-frequentes" />
                            <Label htmlFor="pouco-frequentes" className="text-sm">
                              &lt; 3x na semana
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Esporadicos" id="esporadicos" />
                            <Label htmlFor="esporadicos" className="text-sm">
                              Esporádicos
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-purple-900">
                          Intensidade do Ronco (0 a 10)
                        </Label>
                        <div className="mt-2 px-3">
                          <Slider
                            value={[formData.roncosIntensidade || 0]}
                            onValueChange={(value) => updateField('roncosIntensidade', value[0])}
                            max={10}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Muito baixo</span>
                            <span className="font-medium">{formData.roncosIntensidade || 0}</span>
                            <span>Muito alto</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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

            {/* Escala de Sonolência de Epworth - aparece após "Muito sono durante o dia" quando é "Sim" */}
            {condition.key === 'sonolienciaDiurna' && formData.sonolienciaDiurna === 'Sim' && (
              <EpworthSection
                formData={formData}
                updateField={updateField}
                calculateEpworthTotal={calculateEpworthTotal}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};