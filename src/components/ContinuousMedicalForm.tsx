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
  isAllergy?: boolean;
}
export default function ContinuousMedicalForm() {
  const {
    formData,
    updateField,
    updateArrayField,
    calculateAge,
    calculateEpworthTotal,
    calculateCargaTabagica
  } = useMedicalForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!formData.declaracao) {
      toast.error('É necessário confirmar a declaração para enviar o formulário.');
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from('medical_forms').insert([{
        nome_completo: formData.nomeCompleto,
        data_nascimento: formData.dataNascimento,
        idade: formData.idade,
        indicacao: formData.indicacao,
        quem_indicou: formData.quemIndicou,
        form_data: formData as any
      }]);
      if (error) throw error;
      toast.success('Formulário enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const respiratoryFields: FieldGroup[] = [{
    key: 'asma',
    label: 'Asma',
    obsKey: 'asmaObservacoes'
  }, {
    key: 'rinite',
    label: 'Rinite alérgica',
    obsKey: 'riniteObservacoes'
  }, {
    key: 'sinusites',
    label: 'Sinusites',
    obsKey: 'sinusitesObservacoes'
  }, {
    key: 'enfisema',
    label: 'Enfisema',
    obsKey: 'enfisemaObservacoes'
  }, {
    key: 'pneumonias',
    label: 'Pneumonias',
    obsKey: 'pneumoniasObservacoes'
  }, {
    key: 'tuberculose',
    label: 'Tuberculose',
    obsKey: 'tuberculoseObservacoes'
  }];
  const cardiovascularFields: FieldGroup[] = [{
    key: 'pressaoAlta',
    label: 'Pressão arterial alta',
    obsKey: 'pressaoAltaObservacoes'
  }, {
    key: 'colesterolAlto',
    label: 'Colesterol alto',
    obsKey: 'colesterolAltoObservacoes'
  }, {
    key: 'arritmias',
    label: 'Arritmias cardíacas',
    obsKey: 'arritmiasObservacoes'
  }];
  const endocrineFields: FieldGroup[] = [{
    key: 'diabetes',
    label: 'Diabetes',
    obsKey: 'diabetesObservacoes'
  }, {
    key: 'tireoide',
    label: 'Problemas de tireoide',
    obsKey: 'tireoideObservacoes'
  }];
  const otherSystemsFields: FieldGroup[] = [{
    key: 'neurologicos',
    label: 'Problemas neurológicos',
    obsKey: 'neurologicosObservacoes'
  }, {
    key: 'refluxo',
    label: 'Refluxo gastroesofágico',
    obsKey: 'refluxoObservacoes'
  }, {
    key: 'intestinais',
    label: 'Problemas intestinais',
    obsKey: 'intestinaisObservacoes'
  }, {
    key: 'figado',
    label: 'Problemas no fígado',
    obsKey: 'figadoObservacoes'
  }, {
    key: 'urinarios',
    label: 'Problemas urinários',
    obsKey: 'urinariosObservacoes'
  }, {
    key: 'articulacoes',
    label: 'Problemas nas articulações',
    obsKey: 'articulacoesObservacoes'
  }, {
    key: 'psiquiatricos',
    label: 'Problemas psiquiátricos',
    obsKey: 'psiquiatricosObservacoes'
  }, {
    key: 'tromboses',
    label: 'Tromboses',
    obsKey: 'trombosesObservacoes'
  }, {
    key: 'tumores',
    label: 'Tumores',
    obsKey: 'tumoresObservacoes'
  }, {
    key: 'acidentes',
    label: 'Acidentes graves',
    obsKey: 'acidentesObservacoes'
  }];
  const allergyFields: FieldGroup[] = [{
    key: 'alergiasMedicamentos',
    label: 'Alergias a medicamentos',
    listKey: 'alergiasMedicamentosLista',
    isAllergy: true
  }, {
    key: 'alergiasRespiratorias',
    label: 'Alergias respiratórias',
    listKey: 'alergiasRespiratoriasLista',
    isAllergy: true
  }, {
    key: 'alergiasAlimentares',
    label: 'Alergias alimentares',
    listKey: 'alergiasAlimentaresLista',
    isAllergy: true
  }];
  const renderFieldGroup = (fields: FieldGroup[]) => {
    return fields.map(item => <div key={String(item.key)} className="space-y-2">
        <Label className="text-sm font-medium">{item.label}</Label>
        <RadioGroup value={String(formData[item.key] || '')} onValueChange={value => updateField(item.key, value)} className="flex flex-row gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Não" id={`${String(item.key)}-nao`} />
            <Label htmlFor={`${String(item.key)}-nao`}>Não</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Sim" id={`${String(item.key)}-sim`} />
            <Label htmlFor={`${String(item.key)}-sim`}>Sim</Label>
          </div>
        </RadioGroup>
        {formData[item.key] === 'Sim' && <Textarea value={String(formData[item.obsKey as keyof MedicalFormData] || formData[item.listKey as keyof MedicalFormData] || formData[item.key] || '')} onChange={e => {
        const targetKey = item.obsKey || item.listKey || item.key;
        updateField(targetKey as keyof MedicalFormData, e.target.value);
      }} placeholder={item.isAllergy ? "Especifique substâncias e como foi a alergia" : `Descreva detalhes sobre ${item.label.toLowerCase()}`} className="bg-blue-50" rows={2} />}
      </div>);
  };
  return <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader className="bg-cyan-200">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Formulário Médico Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* SEÇÃO LGPD */}
          <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">🛡️</span>
                  </div>
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
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">ℹ️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-3">
                      Uso das Informações
                    </h3>
                    <p className="text-amber-800 leading-relaxed">
                      Os dados fornecidos serão utilizados exclusivamente para as finalidades descritas 
                      neste formulário, e não serão compartilhados com terceiros sem o seu consentimento, 
                      exceto quando exigido por lei.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-3">
                      Consentimento
                    </h3>
                    <p className="text-green-800 leading-relaxed">
                      Ao preencher este formulário, você declara estar ciente e de acordo com os termos 
                      de uso e privacidade aqui apresentados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 1. IDENTIFICAÇÃO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Identificação</h2>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">👤</span>
                  </div>
                  <h3 className="font-semibold text-blue-900">Informações Pessoais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="nomeCompleto" className="text-sm font-medium">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => updateField('nomeCompleto', e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataNascimento" className="text-sm font-medium">
                      Data de Nascimento <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="dataNascimento" 
                      type="date" 
                      value={formData.dataNascimento} 
                      onChange={e => {
                        updateField('dataNascimento', e.target.value);
                        updateField('idade', calculateAge(e.target.value));
                      }} 
                      className="mt-1" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataAtual" className="text-sm font-medium">
                      Data Atual
                    </Label>
                    <Input 
                      id="dataAtual" 
                      type="date" 
                      value={formData.dataAtual} 
                      onChange={e => updateField('dataAtual', e.target.value)} 
                      className="mt-1" 
                    />
                  </div>

                  {formData.idade > 0 && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Idade Atual</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <span className="text-lg font-semibold text-blue-600">
                          {formData.idade} anos
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Indicação Médica</h3>
                
                <div className="space-y-4">
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
              </CardContent>
            </Card>
          </div>

          {/* 2. HISTÓRICO MÉDICO - RESPIRATÓRIO */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h1 className="text-2xl font-bold text-gray-800">Histórico Médico</h1>
              <h2 className="text-xl font-bold text-gray-800">Sistema Respiratório</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(respiratoryFields)}

              <div>
                <Label className="text-sm font-medium">Outras doenças respiratórias</Label>
                <RadioGroup value={String(formData.outrasRespiratorias || '')} onValueChange={value => updateField('outrasRespiratorias', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outras-resp-nao" />
                    <Label htmlFor="outras-resp-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outras-resp-sim" />
                    <Label htmlFor="outras-resp-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrasRespiratorias === 'Sim' && <Textarea value={formData.outrasRespiratoriasObservacoes} onChange={e => updateField('outrasRespiratoriasObservacoes', e.target.value)} placeholder="Descreva outras doenças respiratórias" className="mt-2 bg-blue-50" rows={3} />}
              </div>
            </div>
          </div>

          {/* 3. DISTÚRBIOS DO SONO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Distúrbios do Sono</h2>
            
            <div>
              <Label className="text-sm font-medium">Roncos</Label>
              <RadioGroup value={String(formData.roncos || '')} onValueChange={value => updateField('roncos', value)} className="mt-2 flex flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="roncos-nao" />
                  <Label htmlFor="roncos-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="roncos-sim" />
                  <Label htmlFor="roncos-sim">Sim</Label>
                </div>
              </RadioGroup>
              
              {formData.roncos === 'Sim' && <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Frequência dos roncos</Label>
                    <Input value={formData.roncosFrequencia} onChange={e => updateField('roncosFrequencia', e.target.value)} placeholder="Ex: todas as noites, esporadicamente..." className="mt-1 bg-blue-50" />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Intensidade dos roncos (0-10)</Label>
                    <div className="mt-2 px-3">
                      <Slider value={[formData.roncosIntensidade]} onValueChange={value => updateField('roncosIntensidade', value[0])} max={10} min={0} step={1} className="w-full" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 (Muito fraco)</span>
                        <span className="font-medium">{formData.roncosIntensidade}</span>
                        <span>10 (Muito forte)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Observações sobre roncos</Label>
                    <Textarea value={formData.roncosObservacoes} onChange={e => updateField('roncosObservacoes', e.target.value)} placeholder="Descreva características dos roncos" className="mt-1 bg-blue-50" rows={2} />
                  </div>
                </div>}
            </div>

            <div>
              <Label className="text-sm font-medium">Insônia</Label>
              <RadioGroup value={String(formData.insonia || '')} onValueChange={value => updateField('insonia', value)} className="mt-2 flex flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="insonia-nao" />
                  <Label htmlFor="insonia-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="insonia-sim" />
                  <Label htmlFor="insonia-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.insonia === 'Sim' && <Textarea value={formData.insoniaObservacoes} onChange={e => updateField('insoniaObservacoes', e.target.value)} placeholder="Descreva os problemas de insônia" className="mt-2 bg-blue-50" rows={3} />}
            </div>

            <div>
              <Label className="text-sm font-medium">Sonolência diurna</Label>
              <RadioGroup value={String(formData.sonolienciaDiurna || '')} onValueChange={value => updateField('sonolienciaDiurna', value)} className="mt-2 flex flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="sonolencia-nao" />
                  <Label htmlFor="sonolencia-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="sonolencia-sim" />
                  <Label htmlFor="sonolencia-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.sonolienciaDiurna === 'Sim' && <Textarea value={formData.sonolienciaDiurnaObservacoes} onChange={e => updateField('sonolienciaDiurnaObservacoes', e.target.value)} placeholder="Descreva a sonolência diurna" className="mt-2 bg-blue-50" rows={3} />}
            </div>

            <div>
              <Label className="text-sm font-medium">Outros problemas de sono</Label>
              <RadioGroup value={String(formData.outrosProblemasSono || '')} onValueChange={value => updateField('outrosProblemasSono', value)} className="mt-2 flex flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="outros-sono-nao" />
                  <Label htmlFor="outros-sono-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="outros-sono-sim" />
                  <Label htmlFor="outros-sono-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.outrosProblemasSono === 'Sim' && <Textarea value={formData.outrosProblemasSonoObservacoes} onChange={e => updateField('outrosProblemasSonoObservacoes', e.target.value)} placeholder="Descreva outros problemas de sono" className="mt-2 bg-blue-50" rows={3} />}
            </div>
          </div>

          {/* 4. ESCALA DE EPWORTH - Só mostra se sonolência diurna for "Sim" */}
          {formData.sonolienciaDiurna === 'Sim' && <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Escala de Sonolência de Epworth</h2>
              <p className="text-sm text-gray-600">
                Qual a probabilidade de você cochilar ou adormecer nas seguintes situações? 
                (0 = nunca cochilaria, 1 = pequena chance, 2 = chance moderada, 3 = alta chance)
              </p>
              
              <div className="space-y-4">
                {[{
              key: 'epworthLendo' as keyof MedicalFormData,
              label: 'Sentado e lendo'
            }, {
              key: 'epworthTV' as keyof MedicalFormData,
              label: 'Assistindo TV'
            }, {
              key: 'epworthPublico' as keyof MedicalFormData,
              label: 'Sentado em lugar público (cinema, igreja, sala de espera)'
            }, {
              key: 'epworthTransporte' as keyof MedicalFormData,
              label: 'Como passageiro de trem, carro ou ônibus, andando uma hora sem parar'
            }, {
              key: 'epworthDescansando' as keyof MedicalFormData,
              label: 'Descansando à tarde quando as circunstâncias permitem'
            }, {
              key: 'epworthConversando' as keyof MedicalFormData,
              label: 'Sentado e conversando com alguém'
            }, {
              key: 'epworthAposRefeicao' as keyof MedicalFormData,
              label: 'Sentado calmamente após um almoço sem álcool'
            }, {
              key: 'epworthDirigindo' as keyof MedicalFormData,
              label: 'Em um carro, enquanto para por alguns minutos no trânsito'
            }].map(item => <div key={String(item.key)} className="space-y-2">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <RadioGroup value={formData[item.key] !== undefined ? String(formData[item.key]) : ''} onValueChange={value => updateField(item.key, parseInt(value))} className="flex flex-row gap-6">
                      {[0, 1, 2, 3].map(score => <div key={score} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(score)} id={`${String(item.key)}-${score}`} />
                          <Label htmlFor={`${String(item.key)}-${score}`}>{score}</Label>
                        </div>)}
                    </RadioGroup>
                  </div>)}
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium">Total da Escala de Epworth: {formData.epworthTotal}</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    0-7: Improvável que você tenha sonolência anormal<br />
                    8-9: Sonolência leve<br />
                    10-15: Sonolência moderada<br />
                    16-24: Sonolência severa
                  </p>
                </div>
              </div>
            </div>}

          {/* 5. CARDIOVASCULAR */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Sistema Cardiovascular</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(cardiovascularFields)}

              <div>
                <Label className="text-sm font-medium">Outros problemas cardíacos</Label>
                <RadioGroup value={String(formData.outrosCardiacos || '')} onValueChange={value => updateField('outrosCardiacos', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="cardiaca-nao" />
                    <Label htmlFor="cardiaca-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="cardiaca-sim" />
                    <Label htmlFor="cardiaca-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosCardiacos === 'Sim' && <Textarea value={formData.outrosCardiacosObservacoes} onChange={e => updateField('outrosCardiacosObservacoes', e.target.value)} placeholder="Descreva outros problemas cardíacos" className="mt-2 bg-blue-50" rows={3} />}
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
                <RadioGroup value={String(formData.outrosProblemas || '')} onValueChange={value => updateField('outrosProblemas', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="outros-nao" />
                    <Label htmlFor="outros-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="outros-sim" />
                    <Label htmlFor="outros-sim">Sim</Label>
                  </div>
                </RadioGroup>
                {formData.outrosProblemas === 'Sim' && <Textarea value={formData.outrosProblemasObservacoes} onChange={e => updateField('outrosProblemasObservacoes', e.target.value)} placeholder="Descreva outros problemas de saúde" className="mt-2 bg-blue-50" rows={3} />}
              </div>
            </div>
          </div>

          {/* 8. TRANSFUSÃO */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Transfusão de Sangue</h2>
            
            <div>
              <Label className="text-sm font-medium">Já recebeu transfusão de sangue?</Label>
              <RadioGroup value={String(formData.transfusao || '')} onValueChange={value => updateField('transfusao', value)} className="mt-2 flex flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="transfusao-nao" />
                  <Label htmlFor="transfusao-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="transfusao-sim" />
                  <Label htmlFor="transfusao-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.transfusao === 'Sim' && <Textarea value={formData.transfusaoDetalhes} onChange={e => updateField('transfusaoDetalhes', e.target.value)} placeholder="Descreva quando e por que recebeu transfusão" className="mt-2 bg-blue-50" rows={3} />}
            </div>
          </div>

          {/* 12. MEDICAÇÕES ATUAIS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Medicações Atuais</h2>
            <p className="text-sm text-gray-600">
              Liste todas as medicações que você toma atualmente (até 11 medicações)
            </p>
            
            <div className="space-y-4">
              {Array.from({
              length: 11
            }, (_, index) => <div key={index}>
                  <Label className="text-sm font-medium">Medicação {index + 1}</Label>
                  <Input value={formData.medicacoes[index] || ''} onChange={e => updateArrayField('medicacoes', index, e.target.value)} placeholder="Nome da medicação, dosagem e frequência" className="mt-1 bg-blue-50" />
                </div>)}
            </div>
          </div>

          {/* 9. ALERGIAS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Alergias</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFieldGroup(allergyFields)}
            </div>
          </div>

          {/* 13. CIRURGIAS PRÉVIAS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Cirurgias Prévias</h2>
            <p className="text-sm text-gray-600">
              Liste as cirurgias que você já realizou (até 6 cirurgias)
            </p>
            
            <div className="space-y-4">
              {Array.from({
              length: 6
            }, (_, index) => <div key={index}>
                  <Label className="text-sm font-medium">Cirurgia {index + 1}</Label>
                  <Input value={formData.cirurgias[index] || ''} onChange={e => updateArrayField('cirurgias', index, e.target.value)} placeholder="Tipo de cirurgia, ano e motivo" className="mt-1 bg-blue-50" />
                </div>)}
            </div>
          </div>

          {/* 10. HISTÓRIA FAMILIAR */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">História Familiar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pai */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Pai</h3>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <RadioGroup value={String(formData.pai || '')} onValueChange={value => updateField('pai', value)} className="mt-2 flex flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Vivo" id="pai-vivo" />
                      <Label htmlFor="pai-vivo">Vivo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Falecido" id="pai-falecido" />
                      <Label htmlFor="pai-falecido">Falecido</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.pai === 'Vivo' && <div>
                    <Label className="text-sm font-medium">Doenças atuais</Label>
                    <Textarea value={formData.paiDoencas} onChange={e => updateField('paiDoencas', e.target.value)} placeholder="Descreva as doenças do pai" className="mt-1 bg-blue-50" rows={2} />
                  </div>}
                
                {formData.pai === 'Falecido' && <div>
                    <Label className="text-sm font-medium">Motivo do falecimento</Label>
                    <Textarea value={formData.paiMotivoFalecimento} onChange={e => updateField('paiMotivoFalecimento', e.target.value)} placeholder="Descreva o motivo do falecimento" className="mt-1 bg-blue-50" rows={2} />
                  </div>}
              </div>

              {/* Mãe */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Mãe</h3>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <RadioGroup value={String(formData.mae || '')} onValueChange={value => updateField('mae', value)} className="mt-2 flex flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Vivo" id="mae-vivo" />
                      <Label htmlFor="mae-vivo">Viva</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Falecida" id="mae-falecida" />
                      <Label htmlFor="mae-falecida">Falecida</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.mae === 'Vivo' && <div>
                    <Label className="text-sm font-medium">Doenças atuais</Label>
                    <Textarea value={formData.maeDoencas} onChange={e => updateField('maeDoencas', e.target.value)} placeholder="Descreva as doenças da mãe" className="mt-1 bg-blue-50" rows={2} />
                  </div>}
                
                {formData.mae === 'Falecida' && <div>
                    <Label className="text-sm font-medium">Motivo do falecimento</Label>
                    <Textarea value={formData.maeMotivoFalecimento} onChange={e => updateField('maeMotivoFalecimento', e.target.value)} placeholder="Descreva o motivo do falecimento" className="mt-1 bg-blue-50" rows={2} />
                  </div>}
              </div>
            </div>

            {/* Irmãos e Filhos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">Irmãos</Label>
                <RadioGroup value={String(formData.irmaos || '')} onValueChange={value => updateField('irmaos', value)} className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim, tenho irmãos" id="irmaos-sim" />
                    <Label htmlFor="irmaos-sim">Sim, tenho irmãos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não tenho irmãos" id="irmaos-nao" />
                    <Label htmlFor="irmaos-nao">Não tenho irmãos</Label>
                  </div>
                </RadioGroup>
                {formData.irmaos === 'Sim, tenho irmãos' && <Textarea value={formData.irmaosDoencas} onChange={e => updateField('irmaosDoencas', e.target.value)} placeholder="Descreva problemas de saúde dos irmãos" className="mt-2 bg-blue-50" rows={2} />}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Filhos</Label>
                <RadioGroup value={String(formData.filhos || '')} onValueChange={value => updateField('filhos', value)} className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim, tenho filhos" id="filhos-sim" />
                    <Label htmlFor="filhos-sim">Sim, tenho filhos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não tenho filhos" id="filhos-nao" />
                    <Label htmlFor="filhos-nao">Não tenho filhos</Label>
                  </div>
                </RadioGroup>
                {formData.filhos === 'Sim, tenho filhos' && <Textarea value={formData.filhosDoencas} onChange={e => updateField('filhosDoencas', e.target.value)} placeholder="Descreva problemas de saúde dos filhos" className="mt-2 bg-blue-50" rows={2} />}
              </div>
            </div>

            {/* Outros parentes */}
            <div>
              <Label className="text-sm font-medium">Outros parentes com problemas de saúde relevantes</Label>
              <RadioGroup value={String(formData.outrosParentes || '')} onValueChange={value => updateField('outrosParentes', value)} className="mt-2 flex flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="outros-parentes-nao" />
                  <Label htmlFor="outros-parentes-nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="outros-parentes-sim" />
                  <Label htmlFor="outros-parentes-sim">Sim</Label>
                </div>
              </RadioGroup>
              {formData.outrosParentes === 'Sim' && <Textarea value={formData.outrosParentesDetalhes} onChange={e => updateField('outrosParentesDetalhes', e.target.value)} placeholder="Descreva outros parentes e seus problemas de saúde" className="mt-2 bg-blue-50" rows={3} />}
            </div>
          </div>

          {/* 11. HÁBITOS PESSOAIS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Hábitos Pessoais</h2>
            
            {/* Tabagismo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Tabagismo</h3>
              
              <div>
                <Label className="text-sm font-medium">Fuma atualmente?</Label>
                <RadioGroup value={String(formData.fumaAtualmente || '')} onValueChange={value => updateField('fumaAtualmente', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="fuma-nao" />
                    <Label htmlFor="fuma-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="fuma-sim" />
                    <Label htmlFor="fuma-sim">Sim</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.fumaAtualmente === 'Sim' && <div className="space-y-4 bg-blue-50 p-4 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">Com que idade começou a fumar?</Label>
                    <Input type="number" value={formData.idadeComecouFumar || ''} onChange={e => {
                      updateField('idadeComecouFumar', e.target.value ? Number(e.target.value) : undefined);
                      setTimeout(() => calculateCargaTabagica(), 100);
                    }} placeholder="Ex: 18" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tipo de fumo</Label>
                      <Input value={formData.tipoFumo} onChange={e => updateField('tipoFumo', e.target.value)} placeholder="Ex: cigarro, cachimbo, charuto" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cigarros por dia</Label>
                       <Input type="number" value={formData.cigarrosPorDia || ''} onChange={e => {
                         updateField('cigarrosPorDia', e.target.value ? Number(e.target.value) : undefined);
                         setTimeout(() => calculateCargaTabagica(), 100);
                       }} className="mt-1" />
                    </div>
                  </div>
                  {formData.idadeComecouFumar && formData.cigarrosPorDia && <div className="mt-4 p-3 bg-amber-100 rounded-md">
                      <Label className="text-sm font-medium">Carga Tabágica:</Label>
                      <div className="text-lg font-semibold text-amber-800">
                        {formData.cargaTabagica} anos-maço
                      </div>
                    </div>}
                </div>}

              {formData.fumaAtualmente === 'Não' && <div>
                  <Label className="text-sm font-medium">Já fumou antes?</Label>
                  <RadioGroup value={String(formData.jaFumou || '')} onValueChange={value => updateField('jaFumou', value)} className="mt-2 flex flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id="ja-fumou-nao" />
                      <Label htmlFor="ja-fumou-nao">Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id="ja-fumou-sim" />
                      <Label htmlFor="ja-fumou-sim">Sim</Label>
                    </div>
                  </RadioGroup>
                  
                  {formData.jaFumou === 'Sim' && <div className="space-y-4 bg-blue-50 p-4 rounded-md mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Com que idade começou a fumar?</Label>
                           <Input type="number" value={formData.idadeComecouFumarEx || ''} onChange={e => {
                             updateField('idadeComecouFumarEx', e.target.value ? Number(e.target.value) : undefined);
                             setTimeout(() => calculateCargaTabagica(), 100);
                           }} placeholder="Ex: 18" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Com que idade parou de fumar?</Label>
                           <Input type="number" value={formData.idadeParouFumar || ''} onChange={e => {
                             updateField('idadeParouFumar', e.target.value ? Number(e.target.value) : undefined);
                             setTimeout(() => calculateCargaTabagica(), 100);
                           }} placeholder="Ex: 35" className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Cigarros por dia (quando fumava)</Label>
                         <Input type="number" value={formData.cigarrosPorDiaEx || ''} onChange={e => {
                           updateField('cigarrosPorDiaEx', e.target.value ? Number(e.target.value) : undefined);
                           setTimeout(() => calculateCargaTabagica(), 100);
                         }} placeholder="Ex: 20" className="mt-1" />
                      </div>
                       {formData.idadeComecouFumarEx && formData.idadeParouFumar && formData.cigarrosPorDiaEx && <div className="mt-4 p-3 bg-amber-100 rounded-md">
                           <Label className="text-sm font-medium">Carga Tabágica:</Label>
                           <div className="text-lg font-semibold text-amber-800">
                             {formData.cargaTabagica} anos-maço
                           </div>
                         </div>}
                    </div>}
                </div>}
            </div>

            {/* Álcool */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Consumo de Álcool</h3>
              
              <div>
                <Label className="text-sm font-medium">Consome álcool atualmente?</Label>
                <RadioGroup value={String(formData.consumeAlcool || '')} onValueChange={value => updateField('consumeAlcool', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="alcool-nao" />
                    <Label htmlFor="alcool-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="alcool-sim" />
                    <Label htmlFor="alcool-sim">Sim</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.consumeAlcool === 'Sim' && <div>
                  <Label className="text-sm font-medium">Classificação do consumo</Label>
                  <Input value={formData.classificacaoConsumo} onChange={e => updateField('classificacaoConsumo', e.target.value)} placeholder="Ex: social, moderado, frequente" className="mt-1 bg-blue-50" />
                </div>}
            </div>

            {/* Atividade Física */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Atividade Física</h3>
              
              <div>
                <Label className="text-sm font-medium">Pratica atividade física?</Label>
                <RadioGroup value={String(formData.atividadeFisica || '')} onValueChange={value => updateField('atividadeFisica', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="atividade-nao" />
                    <Label htmlFor="atividade-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="atividade-sim" />
                    <Label htmlFor="atividade-sim">Sim</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.atividadeFisica === 'Sim' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo de atividade</Label>
                    <Input value={formData.tipoAtividade} onChange={e => updateField('tipoAtividade', e.target.value)} placeholder="Ex: caminhada, academia, futebol" className="mt-1 bg-blue-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Frequência semanal</Label>
                    <Input value={formData.frequenciaSemanal} onChange={e => updateField('frequenciaSemanal', e.target.value)} placeholder="Ex: 3x por semana" className="mt-1 bg-blue-50" />
                  </div>
                </div>}
            </div>
          </div>

          {/* 14. VACINAÇÕES */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Vacinações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vacina da Gripe */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Vacina da Gripe (Influenza)</h3>
                <div>
                  <Label className="text-sm font-medium">Tomou a vacina da gripe?</Label>
                  <RadioGroup value={String(formData.influenza || '')} onValueChange={value => updateField('influenza', value)} className="mt-2 flex flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id="influenza-nao" />
                      <Label htmlFor="influenza-nao">Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id="influenza-sim" />
                      <Label htmlFor="influenza-sim">Sim</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.influenza === 'Sim' && <div>
                    <Label className="text-sm font-medium">Ano da última dose</Label>
                    <Input type="number" value={formData.influenzaAno || ''} onChange={e => updateField('influenzaAno', parseInt(e.target.value) || 0)} placeholder="Ex: 2024" className="mt-1 bg-blue-50" />
                  </div>}
              </div>

              {/* Vacina COVID-19 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Vacina COVID-19</h3>
                <div>
                  <Label className="text-sm font-medium">Tomou a vacina COVID-19?</Label>
                  <RadioGroup value={String(formData.covid || '')} onValueChange={value => updateField('covid', value)} className="mt-2 flex flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Não" id="covid-nao" />
                      <Label htmlFor="covid-nao">Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id="covid-sim" />
                      <Label htmlFor="covid-sim">Sim</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.covid === 'Sim' && <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Ano da última dose</Label>
                      <Input type="number" value={formData.covidAno || ''} onChange={e => updateField('covidAno', parseInt(e.target.value) || 0)} placeholder="Ex: 2024" className="mt-1 bg-blue-50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Quantas doses tomou?</Label>
                      <Input value={formData.covidDoses || ''} onChange={e => updateField('covidDoses', e.target.value)} placeholder="Ex: 4 doses" className="mt-1 bg-blue-50" />
                    </div>
                  </div>}
              </div>
            </div>

            {/* Vacina Pneumocócica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Vacina Pneumocócica</h3>
              <div>
                <Label className="text-sm font-medium">Tomou a vacina pneumocócica?</Label>
                <RadioGroup value={String(formData.pneumococcica || '')} onValueChange={value => updateField('pneumococcica', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="pneumococica-nao" />
                    <Label htmlFor="pneumococica-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="pneumococica-sim" />
                    <Label htmlFor="pneumococica-sim">Sim</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.pneumococcica === 'Sim' && <div className="space-y-4 bg-blue-50 p-4 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">Qual vacina pneumocócica? (pode marcar mais de uma)</Label>
                    <div className="mt-2 space-y-2">
                      {['Prevenar13', 'Pneumo15', 'Prevenar20', 'Pneumo23'].map((vacina) => (
                        <div key={vacina} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`pneumo-${vacina}`}
                            checked={formData.tiposPneumococcica?.includes(vacina) || false}
                            onCheckedChange={(checked) => {
                              const current = formData.tiposPneumococcica || [];
                              if (checked) {
                                updateField('tiposPneumococcica', [...current, vacina]);
                              } else {
                                updateField('tiposPneumococcica', current.filter(t => t !== vacina));
                              }
                            }}
                          />
                          <Label htmlFor={`pneumo-${vacina}`}>{vacina}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ano da vacinação</Label>
                    <Input type="number" value={formData.pneumococcicaAno || ''} onChange={e => updateField('pneumococcicaAno', parseInt(e.target.value) || 0)} placeholder="Ex: 2023" className="mt-1" />
                  </div>
                </div>}
            </div>

            {/* Outras Vacinas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Outras Vacinas</h3>
              <p className="text-sm text-gray-600">
                Descreva outras vacinas que tomou recentemente
              </p>
              
              <div>
                <Label className="text-sm font-medium">Outras vacinas</Label>
                <Textarea
                  value={formData.outrasVacinasTexto || ''}
                  onChange={(e) => updateField('outrasVacinasTexto', e.target.value)}
                  placeholder="Liste outras vacinas e seus anos de aplicação"
                  className="mt-1 bg-blue-50"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 15. RASTREAMENTOS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Rastreamentos</h2>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Colonoscopia</h3>
              <div>
                <Label className="text-sm font-medium">Já fez colonoscopia?</Label>
                <RadioGroup value={String(formData.colonoscopia || '')} onValueChange={value => updateField('colonoscopia', value)} className="mt-2 flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="colonoscopia-nao" />
                    <Label htmlFor="colonoscopia-nao">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="colonoscopia-sim" />
                    <Label htmlFor="colonoscopia-sim">Sim</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.colonoscopia === 'Sim' && <div>
                  <Label className="text-sm font-medium">Ano da última colonoscopia</Label>
                  <Input type="number" value={formData.colonoscopiaAno || ''} onChange={e => updateField('colonoscopiaAno', parseInt(e.target.value) || 0)} placeholder="Ex: 2022" className="mt-1 bg-blue-50" />
                </div>}
            </div>
          </div>

          {/* DECLARAÇÃO FINAL */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Declaração</h2>
            
            <div className="flex items-start space-x-3">
              <Checkbox id="declaracao" checked={formData.declaracao} onCheckedChange={checked => updateField('declaracao', checked)} />
              <Label htmlFor="declaracao" className="text-sm leading-relaxed">
                Declaro que todas as informações fornecidas neste formulário são verdadeiras e completas, 
                e autorizo o uso dessas informações para fins médicos e de tratamento.
              </Label>
            </div>
          </div>

          {/* BOTÃO DE ENVIO */}
          <div className="flex justify-center pt-6">
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.declaracao} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? 'Enviando...' : 'Enviar Formulário'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}