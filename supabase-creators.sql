-- ============================================================
--  Creator commission program — schema
--  Run this in the Supabase SQL editor (project: getrentout waitlist).
--  Keeps creators SEPARATE from the general provider_applications waitlist.
-- ============================================================

-- Phone/WhatsApp is now required at signup — the key the app matches referrals on.
alter table provider_applications add column if not exists phone text;

-- One record per approved creator (invite-only — you add rows here).
create table if not exists creators (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,            -- vanity referral code, e.g. RIYA
  name         text not null,
  phone        text,                            -- creator's own contact / payout
  email        text,
  upi_id       text,                            -- how you pay them later
  instagram    text,                            -- proof they're a real creator
  status       text not null default 'active',  -- active | paused | removed
  notes        text,
  created_at   timestamptz not null default now()
);

-- Every person a creator refers. Grouped under the creator via creator_code.
-- phone = the join key the app will match against Firebase phone auth later.
create table if not exists creator_referrals (
  id             uuid primary key default gen_random_uuid(),
  creator_code   text not null references creators(code) on delete cascade,
  referred_name  text,
  referred_phone text,                          -- THE join key (app verifies via OTP)
  referred_email text,
  city           text,
  -- filled in later, by the app, once this person actually books:
  app_user_id    text,                          -- matched Firebase uid (null until app converts)
  converted       boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists idx_creator_referrals_code  on creator_referrals(creator_code);
create index if not exists idx_creator_referrals_phone on creator_referrals(referred_phone);
create index if not exists idx_creator_referrals_email on creator_referrals(referred_email);

-- Handy per-creator rollup (count of people each creator brought).
create or replace view creator_summary as
select c.code, c.name, c.status,
       count(r.id)                              as total_referrals,
       count(r.id) filter (where r.converted)   as converted_referrals,
       c.created_at
from creators c
left join creator_referrals r on r.creator_code = c.code
group by c.code, c.name, c.status, c.created_at;
