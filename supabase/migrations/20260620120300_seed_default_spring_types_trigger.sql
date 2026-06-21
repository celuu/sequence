create or replace function public.handle_new_user_seed_springs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.spring_types (user_id, name, color_hex, sort_order)
  values
    (new.id, 'Yellow', '#F6E05E', 0),
    (new.id, 'Red',    '#E53E3E', 1),
    (new.id, 'Blue',   '#3182CE', 2),
    (new.id, 'Green',  '#38A169', 3)
  on conflict (user_id, name) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_springs on auth.users;
create trigger on_auth_user_created_seed_springs
  after insert on auth.users
  for each row
  execute function public.handle_new_user_seed_springs();
