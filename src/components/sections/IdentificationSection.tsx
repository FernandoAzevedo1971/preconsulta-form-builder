import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, CalendarIcon, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface IdentificationSectionProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  updateArrayField?: (field: string, index: number, value: string) => void;
  calculateAge?: (birthDate: string) => number;
  calculateEpworthTotal?: () => number;
  calculateCargaTabagica?: () => number;
}

export const IdentificationSection: React.FC<IdentificationSectionProps> = ({ 
  formData, 
  updateField, 
  calculateAge 
}) => {
  const handleDateChange = (date: Date | undefined, field: string) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      updateField(field, dateString);
      
      if (field === 'dataNascimento') {
        const age = calculateAge(dateString);
        updateField('idade', age);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Informações Pessoais</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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
                    onSelect={(date) => handleDateChange(date, 'dataNascimento')}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="dataAtual" className="text-sm font-medium">
                Data Atual
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataAtual ? (
                      format(new Date(formData.dataAtual), "dd/MM/yyyy")
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.dataAtual ? new Date(formData.dataAtual) : undefined}
                    onSelect={(date) => handleDateChange(date, 'dataAtual')}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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
  );
};