# Supabase Maintenance Automation

This project automates maintenance tasks on a Supabase database, including archiving old tasks, flagging stale tasks, recalculating priority scores, and removing duplicates.

---

##  Getting Started

### 1. Prerequisites

- Node.js installed ([Download here](https://nodejs.org/))
- Supabase account and project ([Create one here](https://supabase.com/))
- Basic familiarity with SQL and terminal/command prompt

---

### 2. Setup Supabase Database

#### Create tables using the Supabase SQL Editor:

```sql
-- Main tasks table
create table scheduled_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  run_at timestamp with time zone not null,
  is_done boolean default false,
  last_updated timestamp with time zone default now(),
  priority_score numeric default 0,
  is_stale boolean default false
);

-- Archived tasks table (same structure as scheduled_tasks)
create table archived_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  run_at timestamp with time zone not null,
  is_done boolean default false,
  last_updated timestamp with time zone default now(),
  priority_score numeric default 0,
  is_stale boolean default false
);



git clone https://github.com/yourusername/supabase-maintenance.git
cd supabase-maintenance
npm install




SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key



-- Run Project 
-- node maintenance.js



-- Testing Project


-- Old task to archive
insert into scheduled_tasks (title, run_at, is_done, last_updated, priority_score)
values ('Test Old Task', now() - interval '40 days', false, now() - interval '40 days', 50);

-- Stale task to flag
insert into scheduled_tasks (title, run_at, is_done, last_updated, priority_score)
values ('Test Stale Task', now() + interval '5 days', false, now() - interval '70 days', 30);

-- Active task for score recalculation
insert into scheduled_tasks (title, run_at, is_done, last_updated, priority_score)
values ('Test Active Task', now() + interval '2 days', false, now(), 10);

-- Duplicate tasks to remove
insert into scheduled_tasks (title, run_at, is_done, last_updated, priority_score)
values ('Test Duplicate Task', now(), false, now(), 20),
       ('Test Duplicate Task', now(), false, now(), 20);

