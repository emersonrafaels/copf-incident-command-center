-- Fix policy creation (Postgres doesn't support IF NOT EXISTS on policies)
create policy "Occurrences are readable by anyone"
  on public.occurrences
  for select
  using (true);
