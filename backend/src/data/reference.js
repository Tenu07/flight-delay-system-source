const airports = [
  ['ATL', 'Hartsfield-Jackson Atlanta International', 'Atlanta'], ['LAX', 'Los Angeles International', 'Los Angeles'],
  ['ORD', "O'Hare International", 'Chicago'], ['DFW', 'Dallas/Fort Worth International', 'Dallas'],
  ['DEN', 'Denver International', 'Denver'], ['JFK', 'John F. Kennedy International', 'New York'],
  ['SFO', 'San Francisco International', 'San Francisco'], ['SEA', 'Seattle-Tacoma International', 'Seattle'],
  ['LAS', 'Harry Reid International', 'Las Vegas'], ['MCO', 'Orlando International', 'Orlando'],
  ['EWR', 'Newark Liberty International', 'Newark'], ['CLT', 'Charlotte Douglas International', 'Charlotte'],
  ['PHX', 'Phoenix Sky Harbor International', 'Phoenix'], ['IAH', 'George Bush Intercontinental', 'Houston'],
  ['MIA', 'Miami International', 'Miami'], ['BOS', 'Boston Logan International', 'Boston'],
  ['MSP', 'Minneapolis-Saint Paul International', 'Minneapolis'], ['DTW', 'Detroit Metropolitan', 'Detroit'],
  ['PHL', 'Philadelphia International', 'Philadelphia'], ['LGA', 'LaGuardia Airport', 'New York']
].map(([iata, name, city]) => ({ iata, name, city }));

const airlines = [
  ['AA', 'American Airlines'], ['DL', 'Delta Air Lines'], ['UA', 'United Airlines'],
  ['WN', 'Southwest Airlines'], ['AS', 'Alaska Airlines'], ['B6', 'JetBlue Airways'],
  ['NK', 'Spirit Airlines'], ['F9', 'Frontier Airlines'], ['HA', 'Hawaiian Airlines'], ['G4', 'Allegiant Air']
].map(([code, name]) => ({ code, name }));

module.exports = { airports, airlines };
