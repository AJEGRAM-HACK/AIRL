import { z } from 'zod';
export const ScenarioId = z.enum(['greeting', 'decision', 'memory']);
export type Scenario = z.infer<typeof ScenarioId>;
export const scenarioLabels: Record<Scenario, string> = { greeting: 'Introduce yourself', decision: 'What do you think of karaoke night?', memory: 'Tell me about your barangay' };
const responses: Record<string, Record<Scenario, string>> = {
  'captain-bot': { greeting: 'Magandang araw. Captain Bot, at your service. Community optimization is now loading.', decision: 'Mandatory karaoke improves social bonding by an estimated… wait, Tita Nena has unplugged my microphone.', memory: 'I was appointed the first AI barangay captain. My first dataset? The barangay group chat. Apparently, not every forwarded message is legislation.' },
  'tita-nena': { greeting: 'Ako si Tita Nena. Forty years na ako dito. Kahit AI ang kapitan, may kailangan pa ring magpaalala ng common sense.', decision: 'Mandatory karaoke? Anak, may meeting na, may brownout pa. Pati ba problema ko kailangang bumirit?', memory: 'Dito ako tumanda, dito ako natutong makinig. Sinabi ko kay Captain Bot, hindi lahat ng problema nadadaan sa ordinance.' },
  'kuya-taho': { greeting: 'Tahooo! Kuya Taho here. May business idea ka? May extra arnibal ako.', decision: 'Karaoke night? Perfect! Every high note comes with a taho promo. Diskarte lang, boss.', memory: 'Ako ang unang umiikot sa umaga. Bago pa mag-boot si Kapitan, sold out na ang unang batch ko.' },
};
export function scriptedResponse(characterId: string, scenario: Scenario) {
  const response = responses[characterId]?.[ScenarioId.parse(scenario)];
  if (!response) throw new Error('Unknown character scenario');
  return response;
}
