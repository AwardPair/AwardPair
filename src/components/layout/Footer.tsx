export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p className="font-medium text-foreground">AwardPair</p>
        <p>Where award flights meet hotel perks.</p>
        <p className="max-w-2xl text-xs">
          AwardPair is a discovery and valuation tool, not a booking engine and
          not financial advice. Sample data shown on this site is for product
          preview only and does not reflect live award availability, hotel
          rates, or program terms — always verify final pricing on the
          official program portal before booking.
        </p>
      </div>
    </footer>
  );
}
