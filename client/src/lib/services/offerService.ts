import { supabase } from "@shared/supabase";

export interface Offer {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  type: string; // 'primary' ou 'secondary' para estilização
  url: string;
  active: boolean;
}

interface OfferFromSupabase {
  id: number;
  title: string;
  description: string;
  button_text: string;
  type: string;
  url: string;
  active: boolean;
}

export const offerService = {
  // Buscar todas as ofertas ativas
  async getActiveOffers(): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('active', true)
      .order('id');
    
    if (error) {
      console.error('Erro ao buscar ofertas:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map((offer: OfferFromSupabase) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      buttonText: offer.button_text,
      type: offer.type || 'primary',
      url: offer.url || '/produtos',
      active: offer.active
    }));
  }
}; 