import React from 'react';

/**
 * Read-only field display matching Web design.
 * Used in ProfilePage for non-edit mode.
 */
export default function ReadOnlyField({
    label,
    value,
}: {
    label: React.ReactNode;
    value: string | React.ReactNode;
}) {
    return (
        <div className="py-2">
            <div className="text-[14px] font-normal text-muted-foreground mb-1">
                {label}
            </div>
            <div className="text-[16px] font-medium text-foreground">
                {value || (
                    <span className="text-muted-foreground/50">
                        —
                    </span>
                )}
            </div>
        </div>
    );
}
