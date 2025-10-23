
import React from 'react';
const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
    />
));
Label.displayName = 'Label';

export const FormLabel: React.FC<{ htmlFor: string, required?: boolean, children: React.ReactNode, optionalText?: string }> = 
({ htmlFor, required, children, optionalText }) => (
    <Label htmlFor={htmlFor} className="mb-2 block">
        {children}
        {required && <span className="ml-1 text-destructive">*</span>}
        {optionalText && <span className="ml-2 text-xs font-normal text-muted-foreground">{optionalText}</span>}
    </Label>
);
