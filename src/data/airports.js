/**
 * Major airports and cities for autocomplete
 * Format: { code, city, country, name }
 */

export const AIRPORTS = [
  // UK
  { code: 'LHR', city: 'London', country: 'UK', name: 'London Heathrow Airport' },
  { code: 'LGW', city: 'London', country: 'UK', name: 'London Gatwick Airport' },
  { code: 'STN', city: 'London', country: 'UK', name: 'London Stansted Airport' },
  { code: 'LTN', city: 'London', country: 'UK', name: 'London Luton Airport' },
  { code: 'LCY', city: 'London', country: 'UK', name: 'London City Airport' },
  { code: 'MAN', city: 'Manchester', country: 'UK', name: 'Manchester Airport' },
  { code: 'EDI', city: 'Edinburgh', country: 'UK', name: 'Edinburgh Airport' },
  { code: 'BHX', city: 'Birmingham', country: 'UK', name: 'Birmingham Airport' },
  { code: 'GLA', city: 'Glasgow', country: 'UK', name: 'Glasgow Airport' },
  { code: 'BRS', city: 'Bristol', country: 'UK', name: 'Bristol Airport' },
  
  // France
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Paris Charles de Gaulle Airport' },
  { code: 'ORY', city: 'Paris', country: 'France', name: 'Paris Orly Airport' },
  { code: 'NCE', city: 'Nice', country: 'France', name: 'Nice Côte d\'Azur Airport' },
  { code: 'LYS', city: 'Lyon', country: 'France', name: 'Lyon-Saint Exupéry Airport' },
  { code: 'MRS', city: 'Marseille', country: 'France', name: 'Marseille Provence Airport' },
  { code: 'TLS', city: 'Toulouse', country: 'France', name: 'Toulouse-Blagnac Airport' },
  
  // Germany
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport' },
  { code: 'TXL', city: 'Berlin', country: 'Germany', name: 'Berlin Tegel Airport' },
  { code: 'DUS', city: 'Düsseldorf', country: 'Germany', name: 'Düsseldorf Airport' },
  { code: 'HAM', city: 'Hamburg', country: 'Germany', name: 'Hamburg Airport' },
  
  // Spain
  { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Madrid-Barajas Airport' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat Airport' },
  { code: 'AGP', city: 'Málaga', country: 'Spain', name: 'Málaga-Costa del Sol Airport' },
  { code: 'PMI', city: 'Palma', country: 'Spain', name: 'Palma de Mallorca Airport' },
  { code: 'SVQ', city: 'Seville', country: 'Spain', name: 'Seville Airport' },
  
  // Italy
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Rome Fiumicino Airport' },
  { code: 'MXP', city: 'Milan', country: 'Italy', name: 'Milan Malpensa Airport' },
  { code: 'VCE', city: 'Venice', country: 'Italy', name: 'Venice Marco Polo Airport' },
  { code: 'NAP', city: 'Naples', country: 'Italy', name: 'Naples Airport' },
  { code: 'BLQ', city: 'Bologna', country: 'Italy', name: 'Bologna Airport' },
  
  // Netherlands
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Schiphol Airport' },
  { code: 'RTM', city: 'Rotterdam', country: 'Netherlands', name: 'Rotterdam The Hague Airport' },
  
  // Belgium
  { code: 'BRU', city: 'Brussels', country: 'Belgium', name: 'Brussels Airport' },
  
  // Switzerland
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
  { code: 'GVA', city: 'Geneva', country: 'Switzerland', name: 'Geneva Airport' },
  
  // USA
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy International Airport' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles International Airport' },
  { code: 'ORD', city: 'Chicago', country: 'USA', name: 'O\'Hare International Airport' },
  { code: 'MIA', city: 'Miami', country: 'USA', name: 'Miami International Airport' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', name: 'San Francisco International Airport' },
  { code: 'ATL', city: 'Atlanta', country: 'USA', name: 'Hartsfield-Jackson Atlanta International Airport' },
  { code: 'DFW', city: 'Dallas', country: 'USA', name: 'Dallas/Fort Worth International Airport' },
  { code: 'SEA', city: 'Seattle', country: 'USA', name: 'Seattle-Tacoma International Airport' },
  { code: 'BOS', city: 'Boston', country: 'USA', name: 'Boston Logan International Airport' },
  { code: 'LAS', city: 'Las Vegas', country: 'USA', name: 'Las Vegas McCarran International Airport' },
  
  // Asia
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Tokyo Narita International Airport' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Seoul Incheon International Airport' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Bangkok Suvarnabhumi Airport' },
  
  // Canada
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International Airport' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International Airport' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montreal-Pierre Elliott Trudeau International Airport' },
  
  // Australia
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', name: 'Brisbane Airport' },
  { code: 'PER', city: 'Perth', country: 'Australia', name: 'Perth Airport' },
  
  // Africa
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', name: 'Mohammed V International Airport' },
  { code: 'RAK', city: 'Marrakech', country: 'Morocco', name: 'Marrakech Menara Airport' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International Airport' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'OR Tambo International Airport' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', name: 'Cape Town International Airport' },
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', name: 'Murtala Muhammed International Airport' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', name: 'Addis Ababa Bole International Airport' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', name: 'Jomo Kenyatta International Airport' },
  { code: 'TUN', city: 'Tunis', country: 'Tunisia', name: 'Tunis-Carthage International Airport' },
  { code: 'ALG', city: 'Algiers', country: 'Algeria', name: 'Houari Boumediene Airport' },
  
  // Middle East
  { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International Airport' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', name: 'Abu Dhabi International Airport' },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', name: 'Ben Gurion Airport' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'SAW', city: 'Istanbul', country: 'Turkey', name: 'Sabiha Gökçen International Airport' },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', name: 'King Khalid International Airport' },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', name: 'King Abdulaziz International Airport' },
  { code: 'AMM', city: 'Amman', country: 'Jordan', name: 'Queen Alia International Airport' },
  { code: 'BEY', city: 'Beirut', country: 'Lebanon', name: 'Rafic Hariri International Airport' },
  
  // South America
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', name: 'São Paulo-Guarulhos International Airport' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', name: 'Rio de Janeiro-Galeão International Airport' },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', name: 'Ministro Pistarini International Airport' },
  { code: 'SCL', city: 'Santiago', country: 'Chile', name: 'Arturo Merino Benítez International Airport' },
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', name: 'El Dorado International Airport' },
  { code: 'LIM', city: 'Lima', country: 'Peru', name: 'Jorge Chávez International Airport' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City International Airport' },
  { code: 'CUN', city: 'Cancún', country: 'Mexico', name: 'Cancún International Airport' },
  
  // Additional Europe
  { code: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International Airport' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Václav Havel Airport Prague' },
  { code: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw Chopin Airport' },
  { code: 'BUD', city: 'Budapest', country: 'Hungary', name: 'Budapest Ferenc Liszt International Airport' },
  { code: 'ATH', city: 'Athens', country: 'Greece', name: 'Athens International Airport' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', name: 'Lisbon Portela Airport' },
  { code: 'OPO', city: 'Porto', country: 'Portugal', name: 'Francisco Sá Carneiro Airport' },
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Gardermoen Airport' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', name: 'Stockholm Arlanda Airport' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', name: 'Helsinki-Vantaa Airport' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
  
  // Additional Asia
  { code: 'PEK', city: 'Beijing', country: 'China', name: 'Beijing Capital International Airport' },
  { code: 'PVG', city: 'Shanghai', country: 'China', name: 'Shanghai Pudong International Airport' },
  { code: 'CAN', city: 'Guangzhou', country: 'China', name: 'Guangzhou Baiyun International Airport' },
  { code: 'DEL', city: 'Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'BLR', city: 'Bangalore', country: 'India', name: 'Kempegowda International Airport' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport' },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', name: 'Soekarno-Hatta International Airport' },
  { code: 'MNL', city: 'Manila', country: 'Philippines', name: 'Ninoy Aquino International Airport' },
  { code: 'HAN', city: 'Hanoi', country: 'Vietnam', name: 'Noi Bai International Airport' },
  { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam', name: 'Tan Son Nhat International Airport' },
];

/**
 * Search airports by query
 * @param {string} query - Search query
 * @returns {Array} Matching airports
 */
export function searchAirports(query) {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return AIRPORTS.filter(airport => 
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  ).slice(0, 8); // Limit to 8 results
}

/**
 * Format airport for display
 * @param {Object} airport - Airport object
 * @returns {string} Formatted string
 */
export function formatAirport(airport) {
  return `${airport.city} (${airport.code}) - ${airport.country}`;
}
