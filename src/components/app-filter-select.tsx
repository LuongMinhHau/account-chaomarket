import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type AppFilterOptionsType = {
    name: string;
    value: string;
};

export type FilterSelectType = 'tab' | 'radio';

export default function AppFilterSelect({
    options,
    label,
    onChange,
    valueOptions,
    type = 'tab',
}: Readonly<{
    options: AppFilterOptionsType[];
    label: string;
    valueOptions?: string;
    onChange: (value: string) => void;
    type?: FilterSelectType;
}>) {
    // Filter with tab
    if (type === 'tab') {
        return (
            <Tabs
                defaultValue={options[0].value}
                className="w-full"
                value={valueOptions}
                onValueChange={value => onChange(value)}
            >
                <p className="text-[14px] font-semibold">{label}</p>
                <TabsList className="p-0 h-auto bg-brand-dialog flex flex-wrap items-start justify-start shadow-none gap-1 rounded-none">
                    {options.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="border px-4 py-2 rounded-lg cursor-pointer border-transparent data-[state=active]:text-brand-text data-[state=active]:shadow-sm dark:data-[state=active]:text-[var(--brand-color)] dark:data-[state=inactive]:hover:bg-transparent dark:data-[state=inactive]:hover:text-[var(--brand-color)] data-[state=inactive]:text-[var(--brand-grey-foreground)] data-[state=inactive]:hover:text-brand-text data-[state=active]:bg-[var(--brand-grey)] transition-all! duration-300 ease-in-out text-[13px]"
                        >
                            <p className="font-light">{tab.name}</p>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        );
    }

    // Filter with radio group
    if (type === 'radio') {
        return (
            <div className="max-w-xs w-full">
                <p className="text-[16px] mb-2 font-semibold">{label}</p>
                <RadioGroup
                    defaultValue={options[0]?.value}
                    onValueChange={value => onChange(value)}
                    className="flex flex-col gap-0.5"
                    value={valueOptions}
                >
                    {options.map((option, idx) => (
                        <div
                            key={option.value}
                            className="flex items-center space-x-2 hover:[&_*_]:dark:text-white hover:[&_*_]:dark:border-white hover:[&_*_]:dark:stroke-white transition-all! ease-in-out duration-300"
                        >
                            <RadioGroupItem
                                value={option.value}
                                id={option.value}
                                className="dark:data-[state=checked]:border-white cursor-pointer dark:[&_*_svg]:fill-white dark:[&_*_svg]:stroke-white "
                            />
                            <Label
                                htmlFor={option.value}
                                className={`text-[14px] text-[var(--brand-grey-foreground)] font-normal cursor-pointer ${valueOptions === option.value || (valueOptions === undefined && idx === 0) ? 'dark:text-white text-brand-text' : ''}`}
                            >
                                {option.name}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        );
    }
}
