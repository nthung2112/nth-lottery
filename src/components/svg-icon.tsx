import { icons } from "lucide-react";

type IconName = keyof typeof icons;

export function SvgIcon({
  name,
  className,
  color,
  size,
  ...rest
}: {
  name: IconName;
  className?: string;
  color?: string;
  size?: string;
} & React.SVGProps<SVGSVGElement>) {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} className={className} {...rest} />;
}
