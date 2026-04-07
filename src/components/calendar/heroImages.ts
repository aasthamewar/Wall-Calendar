import heroWinter from "@/assets/hero-winter.jpg";
import heroSpring from "@/assets/hero-spring.jpg";
import heroSummer from "@/assets/hero-summer.jpg";
import heroAutumn from "@/assets/hero-autumn.jpg";

const MONTH_IMAGES: Record<number, string> = {
  0: heroWinter,   // January
  1: heroWinter,   // February
  2: heroSpring,   // March
  3: heroSpring,   // April
  4: heroSpring,   // May
  5: heroSummer,   // June
  6: heroSummer,   // July
  7: heroSummer,   // August
  8: heroAutumn,   // September
  9: heroAutumn,   // October
  10: heroAutumn,  // November
  11: heroWinter,  // December
};

export function getHeroForMonth(month: number): string {
  return MONTH_IMAGES[month] ?? heroWinter;
}
