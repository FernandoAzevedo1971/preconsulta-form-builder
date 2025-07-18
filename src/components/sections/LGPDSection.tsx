import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Info } from 'lucide-react';

interface LGPDSectionProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  updateArrayField?: (field: string, index: number, value: string) => void;
  calculateAge?: (birthDate: string) => number;
  calculateEpworthTotal?: () => number;
  calculateCargaTabagica?: () => number;
}

export const LGPDSection: React.FC<LGPDSectionProps> = () => {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
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
            <Info className="h-6 w-6 text-amber-600 mt-1" />
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
  );
};