// Placeholder sections for remaining components
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PlaceholderSection = ({ title }: { title: string }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">Esta seção será implementada em breve.</p>
    </CardContent>
  </Card>
);

export const EndocrineSection = () => <PlaceholderSection title="Sistema Endócrino" />;
export const OtherSystemsSection = () => <PlaceholderSection title="Outros Sistemas" />;
export const AllergiesSection = () => <PlaceholderSection title="Alergias" />;
export const MedicationsSection = () => <PlaceholderSection title="Medicações em Uso" />;
export const SurgeriesSection = () => <PlaceholderSection title="Cirurgias Prévias" />;
export const FamilyHistorySection = () => <PlaceholderSection title="História Familiar" />;
export const PersonalHabitsSection = () => <PlaceholderSection title="Hábitos Pessoais" />;
export const VaccinationsSection = () => <PlaceholderSection title="Histórico de Vacinações" />;
export const ScreeningSection = () => <PlaceholderSection title="Outros Rastreamentos" />;
export const DeclarationSection = () => <PlaceholderSection title="Declaração" />;