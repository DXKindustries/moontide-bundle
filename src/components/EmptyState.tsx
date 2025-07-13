export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-muted-foreground">
      {text}
    </div>
  );
}
