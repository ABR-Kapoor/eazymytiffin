-- =====================================================
-- EazyMyTiffin Complete Supabase PostgreSQL Setup
-- Includes:
-- 1. Extensions
-- 2. Enums
-- 3. Tables
-- 4. Relationships
-- 5. Indexes
-- 6. Triggers
-- 7. Functions
-- 8. Realtime
-- 9. RLS Policies
-- 10. Storage Buckets
-- 11. Helper Functions
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =====================================================
-- ENUMS
-- =====================================================

create type public.user_role as enum (
  'customer',
  'delivery_boy',
  'admin'
);

create type public.user_status as enum (
  'active',
  'blocked'
);

create type public.address_type as enum (
  'home',
  'hostel',
  'office'
);

create type public.subscription_status as enum (
  'active',
  'paused',
  'expired',
  'cancelled'
);

create type public.meal_type as enum (
  'lunch',
  'dinner',
  'both'
);

create type public.food_category as enum (
  'veg',
  'non_veg'
);

create type public.order_status as enum (
  'pending',
  'preparing',
  'assigned',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type public.payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded'
);

create type public.payment_method as enum (
  'phonepe',
  'cod'
);

create type public.delivery_status as enum (
  'assigned',
  'on_the_way',
  'arriving',
  'delivered',
  'failed'
);

create type public.notification_type as enum (
  'system',
  'payment',
  'delivery',
  'subscription'
);

create type public.notification_channel as enum (
  'in_app',
  'email',
  'whatsapp'
);

-- =====================================================
-- USERS TABLE
-- =====================================================

create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  full_name text not null,
  email text unique not null,
  phone text unique not null,
  profile_image text,
  role public.user_role default 'customer',
  status public.user_status default 'active',
  city text default 'Bilaspur',
  is_phone_verified boolean default false,
  has_used_trial boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- ADDRESSES TABLE
-- =====================================================

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type public.address_type not null,
  house_flat_no text,
  landmark text,
  hostel_company_name text,
  floor text,
  area text not null,
  city text default 'Bilaspur',
  google_map_link text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- SUBSCRIPTION PLANS
-- =====================================================

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  meal_type public.meal_type not null,
  category public.food_category not null,
  duration_days integer not null,
  price numeric(10,2) not null,
  is_trial boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id),
  category public.food_category not null,
  meal_type public.meal_type not null,
  remaining_days integer not null,
  total_days integer not null,
  status public.subscription_status default 'active',
  starts_at date not null,
  expires_at date,
  paused_until date,
  assigned_delivery_boy uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- SUBSCRIPTION DAYS
-- =====================================================

create table public.subscription_days (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  meal_date date not null,
  meal_type public.meal_type not null,
  status text default 'upcoming',
  deducted boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- MENUS
-- =====================================================

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  badge text,
  category public.food_category not null,
  meal_type public.meal_type not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =====================================================
-- WEEKLY MENUS
-- =====================================================

create table public.weekly_menu_cycles (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references public.menus(id) on delete cascade,
  weekday integer not null,
  created_at timestamptz default now()
);

-- =====================================================
-- FOOD ORDERS
-- =====================================================

create table public.food_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  address_id uuid references public.addresses(id),
  assigned_delivery_boy uuid references public.users(id),
  status public.order_status default 'pending',
  payment_status public.payment_status default 'pending',
  payment_method public.payment_method not null,
  subtotal numeric(10,2) not null,
  total_amount numeric(10,2) not null,
  notes text,
  eta text,
  time_slot public.meal_type,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- FOOD ORDER ITEMS
-- =====================================================

create table public.food_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.food_orders(id) on delete cascade,
  menu_id uuid references public.menus(id),
  quantity integer default 1,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- =====================================================
-- DELIVERY ASSIGNMENTS
-- =====================================================

create table public.delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.food_orders(id) on delete cascade,
  delivery_boy_id uuid references public.users(id),
  status public.delivery_status default 'assigned',
  eta text,
  proof_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- PAYMENTS
-- =====================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  order_id uuid references public.food_orders(id),
  subscription_id uuid references public.subscriptions(id),
  payment_method public.payment_method,
  payment_status public.payment_status default 'pending',
  transaction_id text,
  amount numeric(10,2),
  created_at timestamptz default now()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type public.notification_type,
  channel public.notification_channel,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- ADMIN LOGS
-- =====================================================

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.users(id),
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- =====================================================
-- INDEXES
-- =====================================================

create index idx_users_role on public.users(role);
create index idx_users_phone on public.users(phone);
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_food_orders_user on public.food_orders(user_id);
create index idx_food_orders_status on public.food_orders(status);
create index idx_notifications_user on public.notifications(user_id);
create index idx_delivery_assignments_boy on public.delivery_assignments(delivery_boy_id);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
before update on public.users
for each row
execute procedure public.handle_updated_at();

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row
execute procedure public.handle_updated_at();

create trigger food_orders_updated_at
before update on public.food_orders
for each row
execute procedure public.handle_updated_at();

create trigger delivery_assignments_updated_at
before update on public.delivery_assignments
for each row
execute procedure public.handle_updated_at();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.food_orders enable row level security;
alter table public.notifications enable row level security;

-- =====================================================
-- USER POLICIES
-- =====================================================

create policy "Users can view own profile"
on public.users
for select
using (auth.uid()::text = clerk_user_id);

create policy "Users can update own profile"
on public.users
for update
using (auth.uid()::text = clerk_user_id);

-- =====================================================
-- ADDRESS POLICIES
-- =====================================================

create policy "Users can manage own addresses"
on public.addresses
for all
using (
  user_id in (
    select id from public.users
    where clerk_user_id = auth.uid()::text
  )
);

-- =====================================================
-- SUBSCRIPTION POLICIES
-- =====================================================

create policy "Users can view own subscriptions"
on public.subscriptions
for select
using (
  user_id in (
    select id from public.users
    where clerk_user_id = auth.uid()::text
  )
);

-- =====================================================
-- FOOD ORDER POLICIES
-- =====================================================

create policy "Users can manage own orders"
on public.food_orders
for all
using (
  user_id in (
    select id from public.users
    where clerk_user_id = auth.uid()::text
  )
);

-- =====================================================
-- NOTIFICATION POLICIES
-- =====================================================

create policy "Users can view own notifications"
on public.notifications
for select
using (
  user_id in (
    select id from public.users
    where clerk_user_id = auth.uid()::text
  )
);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true);

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true);

insert into storage.buckets (id, name, public)
values ('delivery-proofs', 'delivery-proofs', true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

create policy "Public profile images"
on storage.objects
for select
using (bucket_id = 'profile-images');

create policy "Authenticated upload profile images"
on storage.objects
for insert
with check (
  bucket_id = 'profile-images'
  and auth.role() = 'authenticated'
);

create policy "Public menu images"
on storage.objects
for select
using (bucket_id = 'menu-images');

create policy "Authenticated upload menu images"
on storage.objects
for insert
with check (
  bucket_id = 'menu-images'
  and auth.role() = 'authenticated'
);

create policy "Authenticated upload delivery proof"
on storage.objects
for insert
with check (
  bucket_id = 'delivery-proofs'
  and auth.role() = 'authenticated'
);

-- =====================================================
-- REALTIME ENABLEMENT
-- =====================================================

alter publication supabase_realtime add table public.subscriptions;
alter publication supabase_realtime add table public.food_orders;
alter publication supabase_realtime add table public.delivery_assignments;
alter publication supabase_realtime add table public.notifications;

-- =====================================================
-- HELPER FUNCTION
-- =====================================================

create or replace function public.is_admin(user_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = user_uuid
    and role = 'admin'
  );
$$;

-- =====================================================
-- AUTO NOTIFICATION FUNCTION
-- =====================================================

create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_type public.notification_type,
  p_channel public.notification_channel
)
returns void
language plpgsql
as $$
begin
  insert into public.notifications (
    user_id,
    title,
    body,
    type,
    channel
  )
  values (
    p_user_id,
    p_title,
    p_body,
    p_type,
    p_channel
  );
end;
$$;

-- =====================================================
-- TRIAL PREVENTION FUNCTION
-- =====================================================

create or replace function public.can_use_trial(user_uuid uuid)
returns boolean
language sql
stable
as $$
  select not has_used_trial
  from public.users
  where id = user_uuid;
$$;

-- =====================================================
-- DELIVERY ETA UPDATE FUNCTION
-- =====================================================

create or replace function public.update_delivery_eta(
  assignment_uuid uuid,
  new_eta text
)
returns void
language plpgsql
as $$
begin
  update public.delivery_assignments
  set eta = new_eta
  where id = assignment_uuid;
end;
$$;

-- =====================================================
-- END OF COMPLETE DATABASE SETUP
-- =====================================================