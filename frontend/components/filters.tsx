'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDownIcon } from 'lucide-react';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';

const roleOptions = [
  { id: 'all', label: 'Всё' },
  { id: 'learn', label: 'Хочу научиться' },
  { id: 'teach', label: 'Могу научить' },
];

const skillCategories = [
  { id: 'business', label: 'Бизнес и карьера', isCollapsible: true },
  { id: 'creativity', label: 'Творчество и искусство' },
  { id: 'languages', label: 'Иностранные языки' },
  { id: 'education', label: 'Образование и развитие' },
  { id: 'health', label: 'Здоровье и лайфстайл' },
  { id: 'home', label: 'Дом и уют' },
];

const genderOptions = [
  { id: 'any', label: 'Не имеет значения' },
  { id: 'male', label: 'Мужской' },
  { id: 'female', label: 'Женский' },
];

const cityOptions = [
  { id: 'moscow', label: 'Москва' },
  { id: 'saint-petersburg', label: 'Санкт-Петербург' },
  { id: 'novosibirsk', label: 'Новосибирск' },
  { id: 'yekaterinburg', label: 'Екатеринбург' },
  { id: 'kazan', label: 'Казань' },
];

export function Filters() {
  const [selectedRole, setSelectedRole] = React.useState('all');
  const [selectedGender, setSelectedGender] = React.useState('any');

  return (
    <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl font-semibold text-foreground">Фильтры</h2>
        <div className="flex flex-col gap-8">
          <FieldSet>
            <RadioGroup
              defaultValue={selectedRole}
              onValueChange={setSelectedRole}
              aria-label="Role"
              className="gap-4"
            >
              <FieldGroup className="gap-4">
                {roleOptions.map((option) => (
                  <Field orientation="horizontal" key={option.id} className="gap-3">
                    <RadioGroupItem
                      value={option.id}
                      id={`role-${option.id}`}
                      className="size-5"
                    />
                    <FieldLabel
                      htmlFor={`role-${option.id}`}
                      className="font-normal text-base"
                    >
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="text-xl font-semibold text-foreground mb-4">
              Навыки
            </FieldLegend>
            <FieldGroup className="gap-3">
              {skillCategories.map((category) =>
                category.isCollapsible ? (
                  <Collapsible key={category.id} className="w-full">
                    <div className="flex w-full items-center">
                      <Field orientation="horizontal" className="flex-grow gap-3">
                        <Checkbox id={`skill-${category.id}`} className="size-5 rounded" />
                        <FieldLabel
                          htmlFor={`skill-${category.id}`}
                          className="font-normal text-base"
                        >
                          {category.label}
                        </FieldLabel>
                      </Field>
                      <CollapsibleTrigger asChild className="size-6 p-0">
                        <Button variant="ghost" size="icon" className="size-6 p-0">
                          <ChevronDownIcon className="size-5 transition-transform duration-200" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      {/* Add collapsible content here if needed */}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Field orientation="horizontal" key={category.id} className="gap-3">
                    <Checkbox id={`skill-${category.id}`} className="size-5 rounded" />
                    <FieldLabel
                      htmlFor={`skill-${category.id}`}
                      className="font-normal text-base"
                    >
                      {category.label}
                    </FieldLabel>
                  </Field>
                ),
              )}
              <Button
                variant="ghost"
                className="mt-2 h-auto justify-start p-0 text-primary hover:bg-transparent hover:underline"
              >
                Все категории
                <ChevronDownIcon className="ml-1 size-4" />
              </Button>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="text-xl font-semibold text-foreground mb-4">
              Пол автора
            </FieldLegend>
            <RadioGroup
              defaultValue={selectedGender}
              onValueChange={setSelectedGender}
              aria-label="Gender"
              className="gap-4"
            >
              <FieldGroup className="gap-4">
                {genderOptions.map((option) => (
                  <Field orientation="horizontal" key={option.id} className="gap-3">
                    <RadioGroupItem
                      value={option.id}
                      id={`gender-${option.id}`}
                      className="size-5"
                    />
                    <FieldLabel
                      htmlFor={`gender-${option.id}`}
                      className="font-normal text-base"
                    >
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="text-xl font-semibold text-foreground mb-4">
              Город
            </FieldLegend>
            <FieldGroup className="gap-3">
              {cityOptions.map((city) => (
                <Field orientation="horizontal" key={city.id} className="gap-3">
                  <Checkbox id={`city-${city.id}`} className="size-5 rounded" />
                  <FieldLabel
                    htmlFor={`city-${city.id}`}
                    className="font-normal text-base"
                  >
                    {city.label}
                  </FieldLabel>
                </Field>
              ))}
              <Button
                variant="ghost"
                className="mt-2 h-auto justify-start p-0 text-primary hover:bg-transparent hover:underline"
              >
                Все города
                <ChevronDownIcon className="ml-1 size-4" />
              </Button>
            </FieldGroup>
          </FieldSet>
        </div>
      </div>
    </div>
  );
}

export default Filters;