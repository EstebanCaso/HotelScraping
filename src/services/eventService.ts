import { supabase } from '../lib/supabase';
import { Event } from '../types';

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, nombre, fecha, lugar, enlace, distancia, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const saveEvent = async (event: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        nombre: event.nombre,
        fecha: event.fecha,
        lugar: event.lugar,
        enlace: event.enlace,
        distancia: event.distancia
      }])
      .select('id, nombre, fecha, lugar, enlace, distancia, created_at')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving event:', error);
    return null;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

export const saveEvents = async (events: Omit<Event, 'id' | 'created_at'>[]): Promise<Event[]> => {
  try {
    const eventsToInsert = events.map(event => ({
      nombre: event.nombre,
      fecha: event.fecha,
      lugar: event.lugar,
      enlace: event.enlace,
      distancia: event.distancia
    }));

    const { data, error } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select('id, nombre, fecha, lugar, enlace, distancia, created_at');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error saving events:', error);
    return [];
  }
};