import { redirect } from 'next/navigation';
import { getSesion } from './lib/sesion';

export default async function Inicio() {
  const sesion = await getSesion();
  redirect(sesion ? '/dashboard' : '/login');
}
