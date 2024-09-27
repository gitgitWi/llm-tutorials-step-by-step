import type { Control, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '~/features/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/features/ui/select';
import { LLM_PROVIDERS } from './types';

type LlmProviderSelectorProps<T extends FieldValues = any> = {
  formControl: Control<T>;
  name?: string;
};

export function LlmProviderSelector({
  formControl,
  name = 'provider',
}: LlmProviderSelectorProps) {
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>LLM Provider</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select LLM Provider" />
              </SelectTrigger>
              <SelectContent className="gap-y-1">
                {LLM_PROVIDERS.map(({ groupName, providers }) => (
                  <SelectGroup key={`llm-provider-selector-${groupName}`}>
                    <SelectLabel>{groupName}</SelectLabel>
                    {providers.map(({ key, name, enabled }) => (
                      <SelectItem
                        key={`llm-provider-selector-${groupName}-${key}`}
                        value={key}
                        disabled={!enabled}
                        className="pl-3 text-xs cursor-pointer"
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
