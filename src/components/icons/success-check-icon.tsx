export default function SuccessCheckIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer ring */}
            <circle
                cx="50"
                cy="50"
                r="47"
                className="stroke-[var(--brand-color)]"
                strokeWidth="2"
                strokeOpacity="0.3"
            />
            {/* Filled circle */}
            <circle
                cx="50"
                cy="50"
                r="40"
                className="fill-[var(--brand-color)]"
            />
            {/* Checkmark */}
            <path
                d="M33 50l12 12 22-24"
                className="stroke-black"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
