-- Datos de prueba. Primero crea usuarios en Supabase Auth y reemplaza los UUID.
-- Admin demo: admin@prestamos.com
-- Cobrador demo: cobrador@prestamos.com

insert into public.profiles (id, full_name, email, role, active)
values
  ('4aab4143-50cd-4525-86c7-e181cc644931
', 'Administrador Principal', 'admin@prestamos.com', 'admin', true),
  ('f633538f-3d41-4d8e-bb70-ec206247edd4', 'Cobrador Ruta Norte', 'cobrador@prestamos.com', 'collector', true)
on conflict (id) do nothing;

insert into public.clientes (id, full_name, document_id, phone, address, city, personal_reference, notes, status, assigned_to)
values
  ('10000000-0000-0000-0000-000000000001', 'Ana Maria Gomez', '1020304050', '3005550101', 'Calle 18 # 22-14', 'Barrio Centro', 'Luis Gomez - 3005550199', 'Cliente puntual, negocio de comidas.', 'al_dia', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'Carlos Andres Ruiz', '79888777', '3105550202', 'Carrera 7 # 10-50', 'San Jose', 'Marta Ruiz - 3105550222', 'Tiene una cuota atrasada.', 'moroso', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003', 'Luisa Fernanda Perez', '1122334455', '3155550333', 'Manzana 4 Casa 18', 'Villa Norte', 'Pedro Perez - 3155550344', 'Solicita prestamos semanales.', 'activo', '00000000-0000-0000-0000-000000000002')
on conflict (document_id) do nothing;

insert into public.prestamos (
  id, client_id, amount, interest_rate, installments_count, frequency, start_date, end_date,
  total_to_pay, installment_value, balance, principal_balance, profit, notes, status, created_by
)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1000000, 20, 24, 'diaria', current_date - interval '5 days', current_date + interval '18 days', 1200000, 50000, 1050000, 875000, 200000, 'Prestamo diario para capital de trabajo.', 'activo', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 650000, 18, 12, 'semanal', current_date - interval '35 days', current_date + interval '42 days', 767000, 63917, 575250, 490000, 117000, 'Prestamo semanal.', 'vencido', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.cuotas (loan_id, client_id, number, due_date, amount, paid_amount, balance, late_fee, status)
select
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  gs,
  current_date - interval '5 days' + ((gs - 1) * interval '1 day'),
  50000,
  case when gs <= 3 then 50000 else 0 end,
  case when gs <= 3 then 0 else 50000 end,
  0,
  case when gs <= 3 then 'pagada'::public.installment_status else 'pendiente'::public.installment_status end
from generate_series(1, 24) as gs;

insert into public.pagos (loan_id, client_id, amount, type, method, paid_at, notes, registered_by)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 150000, 'cuota_completa', 'efectivo', current_date - interval '1 day', 'Pago de tres cuotas.', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 191750, 'pago_parcial', 'transferencia', current_date - interval '7 days', 'Pago parcial acumulado.', '00000000-0000-0000-0000-000000000002');
