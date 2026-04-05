-- Settings (bedrijfsinstellingen - 1 rij per user)
create table settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  company_name text not null default '',
  company_email text not null default '',
  company_phone text,
  company_website text,
  address_line1 text not null default '',
  address_line2 text,
  postal_code text not null default '',
  city text not null default '',
  country text not null default 'Nederland',
  kvk_number text not null default '',
  btw_number text not null default '',
  iban text not null default '',
  bank_name text,
  logo_url text,
  default_payment_terms int not null default 30,
  invoice_prefix text not null default 'INV',
  invoice_next_number int not null default 1,
  quote_prefix text not null default 'OFF',
  quote_next_number int not null default 1,
  default_btw_rate decimal not null default 21.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  company_name text not null,
  contact_person text,
  email text not null default '',
  phone text,
  address_line1 text not null default '',
  address_line2 text,
  postal_code text not null default '',
  city text not null default '',
  country text not null default 'Nederland',
  kvk_number text,
  btw_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Document type enum
create type document_type as enum ('quote', 'invoice');

-- Documents (offertes + facturen)
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  client_id uuid not null references clients on delete restrict,
  type document_type not null,
  document_number text not null,
  status text not null default 'concept',
  linked_quote_id uuid references documents on delete set null,
  issue_date date not null default current_date,
  due_date date,
  paid_date date,
  subtotal decimal not null default 0,
  btw_amount decimal not null default 0,
  total decimal not null default 0,
  notes text,
  footer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Document lines
create table document_lines (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents on delete cascade,
  description text not null default '',
  quantity decimal not null default 1,
  unit_price decimal not null default 0,
  btw_rate decimal not null default 21.00,
  line_total decimal not null default 0,
  sort_order int not null default 0
);

-- Indexes
create index idx_clients_user_id on clients (user_id);
create index idx_documents_user_id on documents (user_id);
create index idx_documents_client_id on documents (client_id);
create index idx_documents_type on documents (type);
create index idx_documents_status on documents (status);
create index idx_document_lines_document_id on document_lines (document_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger settings_updated_at before update on settings
  for each row execute function update_updated_at();
create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();
create trigger documents_updated_at before update on documents
  for each row execute function update_updated_at();

-- Row Level Security
alter table settings enable row level security;
alter table clients enable row level security;
alter table documents enable row level security;
alter table document_lines enable row level security;

-- Settings policies
create policy "Users can view own settings" on settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on settings for update using (auth.uid() = user_id);
create policy "Users can delete own settings" on settings for delete using (auth.uid() = user_id);

-- Clients policies
create policy "Users can view own clients" on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on clients for delete using (auth.uid() = user_id);

-- Documents policies
create policy "Users can view own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on documents for delete using (auth.uid() = user_id);

-- Document lines policies (via document ownership)
create policy "Users can view own document lines" on document_lines for select
  using (exists (select 1 from documents where documents.id = document_lines.document_id and documents.user_id = auth.uid()));
create policy "Users can insert own document lines" on document_lines for insert
  with check (exists (select 1 from documents where documents.id = document_lines.document_id and documents.user_id = auth.uid()));
create policy "Users can update own document lines" on document_lines for update
  using (exists (select 1 from documents where documents.id = document_lines.document_id and documents.user_id = auth.uid()));
create policy "Users can delete own document lines" on document_lines for delete
  using (exists (select 1 from documents where documents.id = document_lines.document_id and documents.user_id = auth.uid()));

-- Atomic document number generation
create or replace function generate_document_number(
  p_user_id uuid,
  p_type document_type
)
returns text as $$
declare
  v_prefix text;
  v_next_number int;
  v_year text;
  v_result text;
begin
  v_year := to_char(current_date, 'YYYY');

  if p_type = 'invoice' then
    update settings
    set invoice_next_number = invoice_next_number + 1
    where user_id = p_user_id
    returning invoice_prefix, invoice_next_number - 1 into v_prefix, v_next_number;
  else
    update settings
    set quote_next_number = quote_next_number + 1
    where user_id = p_user_id
    returning quote_prefix, quote_next_number - 1 into v_prefix, v_next_number;
  end if;

  if v_prefix is null then
    raise exception 'Geen instellingen gevonden voor deze gebruiker';
  end if;

  v_result := v_prefix || '-' || v_year || '-' || lpad(v_next_number::text, 3, '0');
  return v_result;
end;
$$ language plpgsql security definer;

-- Storage bucket for logos
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict do nothing;

create policy "Users can upload own logos" on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Anyone can view logos" on storage.objects for select
  using (bucket_id = 'logos');
create policy "Users can delete own logos" on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
