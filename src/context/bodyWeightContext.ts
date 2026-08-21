import { createContext, useContext } from 'react'

/**
 * Poids corporel courant (kg) partagé dans l'app pour estimer les calories
 * brûlées là où on ne veut pas faire transiter le profil complet. 0 = inconnu
 * (les calories ne sont alors pas affichées).
 */
export const BodyWeightContext = createContext<number>(0)

export function useBodyWeight() {
  return useContext(BodyWeightContext)
}
