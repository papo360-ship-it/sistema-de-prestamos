-- Sistema de Prestamos - reset de esquema
-- Usa esto solo si estas configurando el proyecto por primera vez o quieres borrar el intento parcial.
-- Borra tablas, politicas, funciones y tipos creados para esta app.

drop table if exists public.pagos cascade;
drop table if exists public.cuotas cascade;
drop table if exists public.prestamos cascade;
drop table if exists public.clientes cascade;
drop table if exists public.configuracion cascade;
drop table if exists public.historial_movimientos cascade;
drop table if exists public.profiles cascade;

drop function if exists public.current_role() cascade;

drop type if exists public.payment_method cascade;
drop type if exists public.payment_type cascade;
drop type if exists public.frequency_type cascade;
drop type if exists public.installment_status cascade;
drop type if exists public.loan_status cascade;
drop type if exists public.client_status cascade;
drop type if exists public.late_fee_type cascade;
drop type if exists public.app_role cascade;
