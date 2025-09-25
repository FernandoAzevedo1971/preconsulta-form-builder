import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MedicalFormData } from '@/types/medical-form';

interface PersonalHabitsProps {
  formData: MedicalFormData;
  updateField: (field: keyof MedicalFormData, value: any) => void;
  updateArrayField?: (field: keyof MedicalFormData, index: number, value: string) => void;
  calculateAge?: (birthDate: string) => number;
  calculateEpworthTotal?: () => number;
  calculateCargaTabagica?: () => number;
}

export const PersonalHabitsSection: React.FC<PersonalHabitsProps> = ({
  formData,
  updateField,
}) => {
  return (
    <div className="space-y-6">
      {/* Tabagismo */}
      <Card>
        <CardHeader>
          <CardTitle>Tabagismo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fuma atualmente?</Label>
            <RadioGroup
              value={formData.fumaAtualmente}
              onValueChange={(value) => updateField('fumaAtualmente', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sim" id="fuma-sim" />
                <Label htmlFor="fuma-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não" id="fuma-nao" />
                <Label htmlFor="fuma-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.fumaAtualmente === 'Não' && (
            <div className="space-y-2">
              <Label>Já fumou anteriormente?</Label>
              <RadioGroup
                value={formData.jaFumou}
                onValueChange={(value) => updateField('jaFumou', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="ja-fumou-sim" />
                  <Label htmlFor="ja-fumou-sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="ja-fumou-nao" />
                  <Label htmlFor="ja-fumou-nao">Não</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tabagismo passivo?</Label>
            <RadioGroup
              value={formData.tabagismoPassivo}
              onValueChange={(value) => updateField('tabagismoPassivo', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sim" id="tabagismo-passivo-sim" />
                <Label htmlFor="tabagismo-passivo-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não" id="tabagismo-passivo-nao" />
                <Label htmlFor="tabagismo-passivo-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.tabagismoPassivo === 'Sim' && (
            <div className="space-y-2">
              <Label>Detalhes do tabagismo passivo</Label>
              <Textarea
                value={formData.tabagismoPassivoDetalhes}
                onChange={(e) => updateField('tabagismoPassivoDetalhes', e.target.value)}
                placeholder="Descreva a exposição ao tabagismo passivo..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Álcool */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo de Álcool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Consome álcool atualmente?</Label>
            <RadioGroup
              value={formData.consumeAlcool}
              onValueChange={(value) => updateField('consumeAlcool', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sim" id="alcool-sim" />
                <Label htmlFor="alcool-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não" id="alcool-nao" />
                <Label htmlFor="alcool-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.consumeAlcool === 'Não' && (
            <div className="space-y-2">
              <Label>Já consumiu álcool anteriormente?</Label>
              <RadioGroup
                value={formData.jaConsumiuAlcool}
                onValueChange={(value) => updateField('jaConsumiuAlcool', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="ja-bebeu-sim" />
                  <Label htmlFor="ja-bebeu-sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="ja-bebeu-nao" />
                  <Label htmlFor="ja-bebeu-nao">Não</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {(formData.consumeAlcool === 'Sim' || formData.jaConsumiuAlcool === 'Sim') && (
            <div className="space-y-2">
              <Label>Observações sobre o consumo</Label>
              <Textarea
                value={formData.consumoObservacoes}
                onChange={(e) => updateField('consumoObservacoes', e.target.value)}
                placeholder="Descreva o padrão de consumo, tipos de bebida, frequência..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atividade Física */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Física</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pratica atividade física atualmente?</Label>
            <RadioGroup
              value={formData.atividadeFisica}
              onValueChange={(value) => updateField('atividadeFisica', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sim" id="atividade-sim" />
                <Label htmlFor="atividade-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não" id="atividade-nao" />
                <Label htmlFor="atividade-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.atividadeFisica === 'Sim' && (
            <>
              <div className="space-y-2">
                <Label>Frequência semanal</Label>
                <Input
                  value={formData.frequenciaSemanal}
                  onChange={(e) => updateField('frequenciaSemanal', e.target.value)}
                  placeholder="Ex: 3 vezes por semana"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de atividade</Label>
                <Input
                  value={formData.tipoAtividade}
                  onChange={(e) => updateField('tipoAtividade', e.target.value)}
                  placeholder="Ex: Caminhada, academia, natação..."
                />
              </div>

              <div className="space-y-2">
                <Label>Tempo total semanal</Label>
                <Input
                  value={formData.tempoTotalSemanal}
                  onChange={(e) => updateField('tempoTotalSemanal', e.target.value)}
                  placeholder="Ex: 150 minutos por semana"
                />
              </div>
            </>
          )}

          {formData.atividadeFisica === 'Não' && (
            <div className="space-y-2">
              <Label>Praticava atividade física anteriormente?</Label>
              <RadioGroup
                value={formData.atividadeFisicaPrevia}
                onValueChange={(value) => updateField('atividadeFisicaPrevia', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="atividade-previa-sim" />
                  <Label htmlFor="atividade-previa-sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="atividade-previa-nao" />
                  <Label htmlFor="atividade-previa-nao">Não</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alimentação */}
      <Card>
        <CardHeader>
          <CardTitle>Alimentação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Alimentação</Label>
            <RadioGroup
              value={formData.tipoAlimentacao}
              onValueChange={(value) => updateField('tipoAlimentacao', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sem restrições" id="alimentacao-sem-restricoes" />
                <Label htmlFor="alimentacao-sem-restricoes">Sem restrições</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="restrições parciais" id="alimentacao-restricoes-parciais" />
                <Label htmlFor="alimentacao-restricoes-parciais">Restrições parciais (especifique)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegana" id="alimentacao-vegana" />
                <Label htmlFor="alimentacao-vegana">Vegana</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.tipoAlimentacao === 'restrições parciais' && (
            <div className="space-y-2">
              <Label>Especifique se desejar (opcional)</Label>
              <Textarea
                value={formData.tipoAlimentacaoEspecificar}
                onChange={(e) => updateField('tipoAlimentacaoEspecificar', e.target.value)}
                placeholder="Descreva as restrições alimentares..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};