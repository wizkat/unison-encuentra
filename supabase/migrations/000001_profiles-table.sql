create type affiliation as enum ('student', 'employee');
create type user_role   as enum ('member', 'operator', 'admin');

create table profiles (
    id            uuid primary key references auth.users(id) on delete cascade,
    entra_oid     uuid,
    email         text not null,
    upn           text,
    student_id    text unique,
    display_name  text not null,
    affiliation   affiliation not null default 'employee',
    role          user_role   not null default 'member',
    first_name    text,
    last_name     text,
    created_at    timestamptz not null default now(),

    constraint student_id_format check (student_id ~ '^[0-9]{9}$'),

    -- Only students has a student ID, and every student has one.
    constraint student_id_matches_affiliation check (
        (affiliation = 'student' and student_id is not null) or
        (affiliation = 'employee' and student_id is null)
    )
);

create index profiles_role_idx on profiles(role) where role <> 'member';
create index profiles_student_id_idx on profiles(student_id);

