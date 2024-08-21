import { ButtonHTMLAttributes } from "react";

interface ButtonInt extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: "primary" | "secondary" | "ghost" | "danger";
  fontSize?: string;
}

export default function RoundedButton({
  children,
  theme = "primary",
  fontSize, // Extracting fontSize here
  ...props
}: ButtonInt) {
  return (
    <button {...props} className={types[theme]} style={{ fontSize }}>
      {children}
    </button>
  );
}

const classDefault =
  "flex items-center justify-center rounded-full w-14 h-14 transition-all";

const types = {
  primary: `${classDefault} border text-white bg-green-500 hover:bg-green-500/80`,
  secondary: `${classDefault} border bg-zinc-100 hover:bg-zinc-200`,
  ghost: `${classDefault} text-gray-500 hover:text-gray-400`,
  danger: `${classDefault} text-white bg-red-500 hover:bg-red-600`,
};
