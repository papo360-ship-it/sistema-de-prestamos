-- Sistema de Prestamos - esquema base para Supabase
-- Ejecuta este archivo en Supabase SQL Editor antes de seed.sql.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'collector');
create type public.client_status as enum ('activo', 'al_dia', 'moroso', 'bloqueado');
create type public.loan_status as enum ('activo', 'finalizado', 'vencido', 'cancelado');
create type public.installment_status as enum ('pagada', 'pendiente', 'parcial', 'vencida');
create type public.frequency_type as enum ('diaria', 'semanal', 'quincenal', 'mensual');
create type public.payment_type as enum ('cuota_completa', 'pago_parcial', 'abono_capital');
create type public.payment_method as enum ('efectivo', 'transferencia', 'tarjeta', 'otro');
create type public.late_fee_type as enum ('fija', 'porcentual');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'collector',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.configuracion (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Sistema de Prestamos',
  logo_url text,
  default_interest_rate numeric(8,2) not null default 20,
  late_fee_enabled boolean not null default true,
  late_fee_type public.late_fee_type not null default 'fija',
  daily_late_fee numeric(14,2) not null default 3000,
  late_fee_percentage numeric(8,2) not null default 1,
  currency text not null default 'COP',
  initial_capital numeric(14,2) not null default 10000000,
  updated_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  photo_url text,
  full_name text not null,
  document_id text not null unique,
  phone text not null,
  address text not null,
  city text not null,
  personal_reference text not null,
  notes text,
  status public.client_status not null default 'activo',
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prestamos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clientes(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  interest_rate numeric(8,2) not null default 0,
  installments_count integer not null check (installments_count > 0),
  frequency public.frequency_type not null,
  start_date date not null,
  end_date date not null,
  total_to_pay numeric(14,2) not null,
  installment_value numeric(14,2) not null,
  balance numeric(14,2) not null,
  principal_balance numeric(14,2) not null,
  profit numeric(14,2) not null,
  notes text,
  status public.loan_status not null default 'activo',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.cuotas (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.prestamos(id) on delete cascade,
  client_id uuid not null references public.clientes(id) on delete cascade,
  number integer not null,
  due_date date not null,
  amount numeric(14,2) not null,
  paid_amount numeric(14,2) not null default 0,
  balance numeric(14,2) not null,
  late_fee numeric(14,2) not null default 0,
  status public.installment_status not null default 'pendiente',
  unique (loan_id, number)
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.prestamos(id) on delete cascade,
  client_id uuid not null references public.clientes(id) on delete cascade,
  installment_id uuid references public.cuotas(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  type public.payment_type not null,
  method public.payment_method not null,
  paid_at date not null default current_date,
  notes text,
  registered_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.historial_movimientos (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  description text not null,
  amount numeric(14,2),
  user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_clientes_assigned_to on public.clientes(assigned_to);
create index idx_prestamos_client_id on public.prestamos(client_id);
create index idx_cuotas_loan_id on public.cuotas(loan_id);
create index idx_cuotas_due_date on public.cuotas(due_date);
create index idx_pagos_paid_at on public.pagos(paid_at);

alter table public.profiles enable row level security;
alter table public.configuracion enable row level security;
alter table public.clientes enable row level security;
alter table public.prestamos enable row level security;
alter table public.cuotas enable row level security;
alter table public.pagos enable row level security;
alter table public.historial_movimientos enable row level security;

create or replace function public.current_role()
returns public.app_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_admin_all" on public.profiles
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "config_select_authenticated" on public.configuracion
for select using (auth.role() = 'authenticated');

create policy "config_admin_all" on public.configuracion
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "clients_select_by_role" on public.clientes
for select using (
  public.current_role() = 'admin'
  or assigned_to = auth.uid()
  or assigned_to is null
);

create policy "clients_admin_all" on public.clientes
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "clients_collector_update_visible" on public.clientes
for update using (public.current_role() = 'collector' and (assigned_to = auth.uid() or assigned_to is null));

create policy "loans_select_by_visible_client" on public.prestamos
for select using (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.clientes c
    where c.id = prestamos.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
);

create policy "loans_admin_all" on public.prestamos
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "loans_collector_update_payment_state" on public.prestamos
for update using (
  public.current_role() = 'collector'
  and exists (
    select 1 from public.clientes c
    where c.id = prestamos.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
) with check (
  public.current_role() = 'collector'
  and exists (
    select 1 from public.clientes c
    where c.id = prestamos.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
);

create policy "installments_select_by_visible_client" on public.cuotas
for select using (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.clientes c
    where c.id = cuotas.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
);

create policy "installments_admin_all" on public.cuotas
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "installments_collector_update_payment_state" on public.cuotas
for update using (
  public.current_role() = 'collector'
  and exists (
    select 1 from public.clientes c
    where c.id = cuotas.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
) with check (
  public.current_role() = 'collector'
  and exists (
    select 1 from public.clientes c
    where c.id = cuotas.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
);

create policy "payments_select_by_visible_client" on public.pagos
for select using (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.clientes c
    where c.id = pagos.client_id and (c.assigned_to = auth.uid() or c.assigned_to is null)
  )
);

create policy "payments_insert_authenticated" on public.pagos
for insert with check (auth.role() = 'authenticated');

create policy "movements_select_authenticated" on public.historial_movimientos
for select using (auth.role() = 'authenticated');

create policy "movements_insert_authenticated" on public.historial_movimientos
for insert with check (auth.role() = 'authenticated');

insert into public.configuracion (business_name, default_interest_rate, late_fee_enabled, late_fee_type, daily_late_fee, late_fee_percentage, currency, initial_capital)
values ('Sistema de Prestamos', 20, true, 'fija', 3000, 1, 'COP', 10000000);
