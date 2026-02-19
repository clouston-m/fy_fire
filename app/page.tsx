import { FireCalculatorForm } from '@/components/calculator/FireCalculatorForm';

export default function HomePage() {
  return (
    <div className="space-y-2">
      <div className="pb-2">
        <h1 className="text-2xl font-bold">FIRE Calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your numbers below to see your Financial Independence target and projected date.
        </p>
      </div>
      <FireCalculatorForm />
    </div>
  );
}
