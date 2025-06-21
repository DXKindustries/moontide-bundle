
// Fallback station data for common coastal areas
export const FALLBACK_STATIONS = {
  // Rhode Island
  '02840': { id: '8452660', name: 'Newport, RI' }, // Newport
  '02842': { id: '8452660', name: 'Newport, RI' }, // Middletown
  '02871': { id: '8452660', name: 'Newport, RI' }, // Portsmouth
  
  // Massachusetts
  '02101': { id: '8443970', name: 'Boston, MA' }, // Boston
  '02109': { id: '8443970', name: 'Boston, MA' }, // Boston
  '02199': { id: '8443970', name: 'Boston, MA' }, // Boston
  '02554': { id: '8447930', name: 'Woods Hole, MA' }, // Woods Hole
  '02539': { id: '8447930', name: 'Woods Hole, MA' }, // Mashpee
  
  // New York
  '10004': { id: '8518750', name: 'The Battery, NY' }, // NYC
  '10005': { id: '8518750', name: 'The Battery, NY' }, // NYC
  '10280': { id: '8518750', name: 'The Battery, NY' }, // NYC
  '11697': { id: '8516945', name: 'Kings Point, NY' }, // Long Island
  
  // Connecticut
  '06511': { id: '8465705', name: 'New Haven, CT' }, // New Haven
  '06460': { id: '8467150', name: 'Bridgeport, CT' }, // Milford
  
  // Florida
  '33139': { id: '8723214', name: 'Virginia Key, FL' }, // Miami Beach
  '33101': { id: '8723214', name: 'Virginia Key, FL' }, // Miami
  '33149': { id: '8723214', name: 'Virginia Key, FL' }, // Miami Beach
  
  // California
  '90401': { id: '9410840', name: 'Santa Monica, CA' }, // Santa Monica
  '90402': { id: '9410840', name: 'Santa Monica, CA' }, // Santa Monica
  '90291': { id: '9410840', name: 'Santa Monica, CA' }, // Venice
  '94107': { id: '9414290', name: 'San Francisco, CA' }, // San Francisco
  '94133': { id: '9414290', name: 'San Francisco, CA' }, // San Francisco
  
  // North Carolina
  '27954': { id: '8652587', name: 'Oregon Inlet Marina, NC' }, // Outer Banks
  '27949': { id: '8652587', name: 'Oregon Inlet Marina, NC' }, // Outer Banks
  
  // South Carolina
  '29401': { id: '8665530', name: 'Charleston, SC' }, // Charleston
  '29403': { id: '8665530', name: 'Charleston, SC' }, // Charleston
  
  // Virginia
  '23451': { id: '8638863', name: 'Chesapeake Bay Bridge Tunnel, VA' }, // Virginia Beach
  '23452': { id: '8638863', name: 'Chesapeake Bay Bridge Tunnel, VA' }, // Virginia Beach
  
  // Maryland
  '21401': { id: '8575512', name: 'Annapolis, MD' }, // Annapolis
  '21403': { id: '8575512', name: 'Annapolis, MD' }, // Annapolis
  
  // Maine
  '04101': { id: '8418150', name: 'Portland, ME' }, // Portland
  '04102': { id: '8418150', name: 'Portland, ME' }, // Portland
  
  // New Hampshire
  '03801': { id: '8423898', name: 'Fort Point, NH' }, // Portsmouth
  '03802': { id: '8423898', name: 'Fort Point, NH' }, // Portsmouth
  
  // Washington
  '98101': { id: '9447130', name: 'Seattle, WA' }, // Seattle
  '98104': { id: '9447130', name: 'Seattle, WA' }, // Seattle
  '98199': { id: '9447130', name: 'Seattle, WA' }, // Seattle
  
  // Oregon
  '97201': { id: '9439040', name: 'Astoria, OR' }, // Portland (use Astoria for tides)
  '97205': { id: '9439040', name: 'Astoria, OR' }, // Portland (use Astoria for tides)
  
  // Texas
  '77058': { id: '8771450', name: 'Galveston Pier 21, TX' }, // Houston area
  '77551': { id: '8771450', name: 'Galveston Pier 21, TX' }, // Galveston
};

export function getFallbackStation(zipCode: string) {
  return FALLBACK_STATIONS[zipCode] || null;
}
