import React, { useState } from 'react';
import { useMedicalForm } from '@/hooks/useMedicalForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MedicalFormData } from '@/types/medical-form';

interface FieldGroup {
  key: keyof MedicalFormData;
  label: string;
  obsKey?: keyof MedicalFormData;
  listKey?: keyof MedicalFormData;
}

export default function ContinuousMedicalForm() {
  const { formData, updateField, updateArrayField, calculateAge, calculateEpworthTotal, calculateCargaTabagica } = useMedicalForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.declaracao) {
      toast.error('É necessário confirmar a declaração para enviar o formulário.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('medical_forms')
        .insert([
          {
            nome_completo: formData.nomeCompleto,
            data_nascimento: formData.dataNascimento,
            idade: formData.idade,
            indicacao: formData.indicacao,
            quem_indicou: formData.quemIndicou,
            form_data: formData as any
          }
        ]);

      if (error) throw error;

      toast.success('Formulário enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const respiratoryFields: FieldGroup[] = [
    { key: 'asma', label: 'Asma', obsKey: 'asmaObservacoes' },
    { key: 'rinite', label: 'Rinite alérgica', obsKey: 'riniteObservacoes' },
    { key: 'sinusites', label: 'Sinusites', obsKey: 'sinusitesObservacoes' },
    { key: 'enfisema', label: 'Enfisema', obsKey: 'enfisemaObservacoes' },
    { key: 'pneumonias', label: 'Pneumonias', obsKey: 'pneumoniasObservacoes' },
    { key: 'tuberculose', label: 'Tuberculose', obsKey: 'tuberculoseObservacoes' },
  ];

  const cardiovascularFields: FieldGroup[] = [
    { key: 'pressaoAlta', label: 'Pressão arterial alta', obsKey: 'pressaoAltaObservacoes' },
    { key: 'colesterolAlto', label: 'Colesterol alto', obsKey: 'colesterolAltoObservacoes' },
    { key: 'arritmias', label: 'Arritmias cardíacas', obsKey: 'arritmiasObservacoes' },
  ];

  const endocrineFields: FieldGroup[] = [
    { key: 'diabetes', label: 'Diabetes', obsKey: 'diabetesObservacoes' },
    { key: 'tireoide', label: 'Problemas de tireoide', obsKey: 'tireoideObservacoes' },
  ];

  const otherSystemsFields: FieldGroup[] = [
    { key: 'neurologicos', label: 'Problemas neurológicos', obsKey: 'neurologicosObservacoes' },
    { key: 'refluxo', label: 'Refluxo gastroesofágico', obsKey: 'refluxoObservacoes' },
    { key: 'intestinais', label: 'Problemas intestinais', obsKey: 'intestinaisObservacoes' },
    { key: 'figado', label: 'Problemas no fígado', obsKey: 'figadoObservacoes' },
    { key: 'urinarios', label: 'Problemas urinários', obsKey: 'urinariosObservacoes' },
    { key: 'articulacoes', label: 'Problemas nas articulações', obsKey: 'articulacoesObservacoes' },
    { key: 'psiquiatricos', label: 'Problemas psiquiátricos', obsKey: 'psiquiatricosObservacoes' },
    { key: 'tromboses', label: 'Tromboses', obsKey: 'trombosesObservacoes' },
    { key: 'tumores', label: 'Tumores', obsKey: 'tumoresObservacoes' },
    { key: 'acidentes', label: 'Acidentes graves', obsKey: 'acidentesObservacoes' },
  ];

  const allergyFields: FieldGroup[] = [
    { key: 'alergiasMedicamentos', label: 'Alergias a medicamentos', listKey: 'alergiasMedicamentosLista' },
    { key: 'alergiasRespiratorias', label: 'Alergias respiratórias', listKey: 'alergiasRespiratoriasLista' },
    { key: 'alergiasAlimentares', label: 'Alergias alimentares', listKey: 'alergiasAlimentaresLista' },
  ];

  const renderFieldGroup = (fields: FieldGroup[]) => {
    return fields.map((item) => (
      <div key={String(item.key)} className="space-y-2">
        <Label className="text-sm font-medium">{item.label}</Label>
        <RadioGroup
          value={String(formData[item.key] || '')}
          onValueChange={(value) => updateField(item.key, value)}
          className="flex flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Não" id={`${String(item.key)}-nao`} />
            <Label htmlFor={`${String(item.key)}-nao`}>Não</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Sim" id={`${String(item.key)}-sim`} />
            <Label htmlFor={`${String(item.key)}-sim`}>Sim</Label>
          </div>
        </RadioGroup>
        {formData[item.key] === 'Sim' && (
          <Textarea
            value={String(formData[item.obsKey || item.listKey || item.key] || '')}
            onChange={(e) => updateField(item.obsKey || item.listKey || item.key, e.target.value)}
            placeholder={`Descreva detalhes sobre ${item.label.toLowerCase()}`}
            className="bg-blue-50"
            rows={2}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Formulário Médico Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 1. IDENTIFICAÇÃO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Identificação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeCompleto" className="text-sm font-medium">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={(e) => updateField('nomeCompleto', e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="dataNascimento" className="text-sm font-medium">Data de Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => {
                    updateField('dataNascimento', e.target.value);
                    updateField('idade', calculateAge(e.target.value));
                  }}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataAtual" className="text-sm font-medium">Data Atual</Label>
                <Input
                  id="dataAtual"
                  type="date"
                  value={formData.dataAtual}
                  onChange={(e) => updateField('dataAtual', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="idade" className="text-sm font-medium">Idade</Label>
                <Input
                  id="idade"
                  type="number"
                  value={formData.idade}
                  onChange={(e) => updateField('idade', parseInt(e.target.value) || 0)}
                  className="mt-1"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="indicacao" className="text-sm font-medium">Indicação</Label>
                <Input
                  id="indicacao"
                  value={formData.indicacao}
                  onChange={(e) => updateField('indicacao', e.target.value)}
                  placeholder="Quem indicou este serviço?"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="quemIndicou" className="text-sm font-medium">Quem Indicou</Label>
                <Input
                  id="quemIndicou"
                  value={formData.quemIndicou}
                  onChange={(e) => updateField('quemIndicou', e.target.value)}
                  placeholder="Nome de quem indicou"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 2. HISTÓRICO MÉDICO - RESPIRATÓRIO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Histórico Médico - Sistema Respiratório</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(respiratoryFields)}

              <div>
                <Label className="text-sm font-medium">Outras doenças respiratórias</Label>
                <RadioGroup
                  value={String(formData.outrasRespiratorias || '')}
                  onValueChange={(value) => updateField('outrasRespiratorias', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outras-resp-nao" />
                    <Label htmlFor="outras-resp-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outras-resp-sim" />
                    <Label htmlFor="outras-resp-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrasRespiratorias === 'Sim' && (
                  <Textarea
                    value={formData.outrasRespiratoriasObservacoes}
                    onChange={(e) => updateField('outrasRespiratoriasObservacoes', e.target.value)}
                    placeholder="Descreva outras doenças respiratórias"
                    className="mt-2 bg-blue-50"
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. DISTÚRBIOS DO SONO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Distúrbios do Sono</h2>
            
            <div>
              <Label className="text-sm font-medium">Roncos</Label>
              <RadioGroup
                value={String(formData.roncos || '')}
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
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Frequência dos roncos</Label>
                    <Input
                      value={formData.roncosFrequencia}
                      onChange={(e) => updateField('roncosFrequencia', e.target.value)}
                      placeholder="Ex: todas as noites, esporadicamente..."
                      className="mt-1 bg-blue-50"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Intensidade dos roncos (0-10)</Label>
                    <div className="mt-2 px-3">
                      <Slider
                        value={[formData.roncosIntensidade]}
                        onValueChange={(value) => updateField('roncosIntensidade', value[0])}
                        max={10}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 (Muito fraco)</span>
                        <span className="font-medium">{formData.roncosIntensidade}</span>
                        <span>10 (Muito forte)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Observações sobre roncos</Label>
                    <Textarea
                      value={formData.roncosObservacoes}
                      onChange={(e) => updateField('roncosObservacoes', e.target.value)}
                      placeholder="Descreva características dos roncos"
                      className="mt-1 bg-blue-50"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Insônia</Label>
              <RadioGroup
                value={String(formData.insonia || '')}
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
                  value={formData.insoniaObservacoes}
                  onChange={(e) => updateField('insoniaObservacoes', e.target.value)}
                  placeholder="Descreva os problemas de insônia"
                  className="mt-2 bg-blue-50"
                  rows={3}
                />
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Sonolência diurna</Label>
              <RadioGroup
                value={String(formData.sonolienciaDiurna || '')}
                onValueChange={(value) => updateField('sonolienciaDiurna', value)}
                className="mt-2 flex flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="sonolencia-nao" />
                  <Label htmlFor="sonolencia-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="sonolencia-sim" />
                  <Label htmlFor="sonolencia-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.sonolienciaDiurna === 'Sim' && (
                <Textarea
                  value={formData.sonolienciaDiurnaObservacoes}
                  onChange={(e) => updateField('sonolienciaDiurnaObservacoes', e.target.value)}
                  placeholder="Descreva a sonolência diurna"
                  className="mt-2 bg-blue-50"
                  rows={3}
                />
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Outros problemas de sono</Label>
              <RadioGroup
                value={String(formData.outrosProblemasSono || '')}
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
                  value={formData.outrosProblemasSonoObservacoes}
                  onChange={(e) => updateField('outrosProblemasSonoObservacoes', e.target.value)}
                  placeholder="Descreva outros problemas de sono"
                  className="mt-2 bg-blue-50"
                  rows={3}
                />
              )}
            </div>
          </div>

          {/* 4. ESCALA DE EPWORTH */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Escala de Sonolência de Epworth</h2>
            <p className="text-sm text-gray-600">
              Qual a probabilidade de você cochilar ou adormecer nas seguintes situações? 
              (0 = nunca cochilaria, 1 = pequena chance, 2 = chance moderada, 3 = alta chance)
            </p>
            
            <div className="space-y-4">
              {[
                { key: 'epworthLendo' as keyof MedicalFormData, label: 'Sentado e lendo' },
                { key: 'epworthTV' as keyof MedicalFormData, label: 'Assistindo TV' },
                { key: 'epworthPublico' as keyof MedicalFormData, label: 'Sentado em lugar público (cinema, igreja, sala de espera)' },
                { key: 'epworthTransporte' as keyof MedicalFormData, label: 'Como passageiro de trem, carro ou ônibus, andando uma hora sem parar' },
                { key: 'epworthDescansando' as keyof MedicalFormData, label: 'Descansando à tarde quando as circunstâncias permitem' },
                { key: 'epworthConversando' as keyof MedicalFormData, label: 'Sentado e conversando com alguém' },
                { key: 'epworthAposRefeicao' as keyof MedicalFormData, label: 'Sentado calmamente após um almoço sem álcool' },
                { key: 'epworthDirigindo' as keyof MedicalFormData, label: 'Em um carro, enquanto para por alguns minutos no trânsito' },
              ].map((item) => (
                <div key={String(item.key)} className="space-y-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <RadioGroup
                    value={String(formData[item.key] || 0)}
                    onValueChange={(value) => updateField(item.key, parseInt(value))}
                    className="flex flex-row gap-6"
                  >
                    {[0, 1, 2, 3].map((score) => (
                      <div key={score} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(score)} id={`${String(item.key)}-${score}`} />
                        <Label htmlFor={`${String(item.key)}-${score}`}>{score}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm font-medium">Total da Escala de Epworth: {calculateEpworthTotal()}</Label>
                <p className="text-xs text-gray-600 mt-1">
                  0-7: Improvável que você tenha sonolência anormal<br/>
                  8-9: Sonolência leve<br/>
                  10-15: Sonolência moderada<br/>
                  16-24: Sonolência severa
                </p>
              </div>
            </div>
          </div>

          {/* 5. CARDIOVASCULAR */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Sistema Cardiovascular</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(cardiovascularFields)}

              <div>
                <Label className="text-sm font-medium">Outros problemas cardíacos</Label>
                <RadioGroup
                  value={String(formData.outrosCardiacos || '')}
                  onValueChange={(value) => updateField('outrosCardiacos', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="cardiaca-nao" />
                    <Label htmlFor="cardiaca-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="cardiaca-sim" />
                    <Label htmlFor="cardiaca-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosCardiacos === 'Sim' && (
                  <Textarea
                    value={formData.outrosCardiacosObservacoes}
                    onChange={(e) => updateField('outrosCardiacosObservacoes', e.target.value)}
                    placeholder="Descreva outros problemas cardíacos"
                    className="mt-2 bg-blue-50"
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 6. ENDÓCRINO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Sistema Endócrino</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(endocrineFields)}
            </div>
          </div>

          {/* 7. OUTROS SISTEMAS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Outros Sistemas</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(otherSystemsFields)}

              <div>
                <Label className="text-sm font-medium">Outros problemas de saúde</Label>
                <RadioGroup
                  value={String(formData.outrosProblemas || '')}
                  onValueChange={(value) => updateField('outrosProblemas', value)}
                  className="mt-2 flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outros-nao" />
                    <Label htmlFor="outros-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outros-sim" />
                    <Label htmlFor="outros-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosProblemas === 'Sim' && (
                  <Textarea
                    value={formData.outrosProblemasObservacoes}
                    onChange={(e) => updateField('outrosProblemasObservacoes', e.target.value)}
                    placeholder="Descreva outros problemas de saúde"
                    className="mt-2 bg-blue-50"
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 8. TRANSFUSÃO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Transfusão de Sangue</h2>
            
            <div>
              <Label className="text-sm font-medium">Já recebeu transfusão de sangue?</Label>
              <RadioGroup
                value={String(formData.transfusao || '')}
                onValueChange={(value) => updateField('transfusao', value)}
                className="mt-2 flex flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="transfusao-nao" />
                  <Label htmlFor="transfusao-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="transfusao-sim" />
                  <Label htmlFor="transfusao-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.transfusao === 'Sim' && (
                <Textarea
                  value={formData.transfusaoDetalhes}
                  onChange={(e) => updateField('transfusaoDetalhes', e.target.value)}
                  placeholder="Descreva quando e por que recebeu transfusão"
                  className="mt-2 bg-blue-50"
                  rows={3}
                />
              )}
            </div>
          </div>

          {/* 9. ALERGIAS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Alergias</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(allergyFields)}
            </div>
          </div>

          {/* DECLARAÇÃO FINAL */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Declaração</h2>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="declaracao"
                checked={formData.declaracao}
                onCheckedChange={(checked) => updateField('declaracao', checked)}
              />
              <Label htmlFor="declaracao" className="text-sm leading-relaxed">
                Declaro que todas as informações fornecidas neste formulário são verdadeiras e completas, 
                e autorizo o uso dessas informações para fins médicos e de tratamento.
              </Label>
            </div>
          </div>

          {/* BOTÃO DE ENVIO */}
          <div className="flex justify-center pt-6">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.declaracao}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Formulário'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}