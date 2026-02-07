export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 26, text: 'text-xl' },
    lg: { icon: 36, text: 'text-3xl' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <span className="inline-flex items-center gap-1.5">
      {}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {}
        <circle cx="18" cy="18" r="15" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
        {}
        <ellipse cx="18" cy="18" rx="15" ry="6" stroke="#1A1A1A" strokeWidth="1" fill="none" opacity="0.3" />
        {}
        <ellipse cx="18" cy="18" rx="6" ry="15" stroke="#1A1A1A" strokeWidth="1" fill="none" opacity="0.3" />
        {}
        <path
          d="M8 26 Q18 6 30 14"
          stroke="#FF3B00"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {}
        <polygon
          points="30,14 26,12 27,16"
          fill="#FF3B00"
        />
        {}
        <circle cx="8" cy="26" r="2" fill="#1A1A1A" />
      </svg>

      {}
      <span className={`${s.text} font-extrabold tracking-tight leading-none`}>
        <span className="text-dark-900">In</span>
        <span className="text-accent">Claim</span>
      </span>
    </span>
  );
}
