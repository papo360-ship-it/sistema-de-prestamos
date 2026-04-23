-- Ejecuta esta migracion si ya habias creado el esquema antes de agregar edicion de prestamos.
-- Permite que el administrador regenere cronogramas al editar prestamos.

drop policy if exists "movements_select_admin" on public.historial_movimientos;
create policy "movements_select_authenticated" on public.historial_movimientos
for select using (auth.role() = 'authenticated');

drop policy if exists "installments_admin_all" on public.cuotas;
create policy "installments_admin_all" on public.cuotas
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
