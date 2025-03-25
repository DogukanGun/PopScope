import { useEffect, useReducer, useCallback } from 'react';
import apiService, { Country } from '@/app/lib/services/api';

interface CountrySelectProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  maxSelections?: number;
}

interface CountryState {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

type CountryAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Country[] }
  | { type: 'FETCH_ERROR'; payload: string };

function countryReducer(state: CountryState, action: CountryAction): CountryState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        countries: action.payload, 
        isLoading: false, 
        error: null 
      };
    case 'FETCH_ERROR':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
    default:
      return state;
  }
}

const CountrySelect = ({
  selectedCountries,
  onCountriesChange,
  maxSelections = 5,
}: CountrySelectProps) => {
  const [state, dispatch] = useReducer(countryReducer, {
    countries: [],
    isLoading: true,
    error: null
  });

  const fetchCountries = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await apiService.getCountries();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to load countries' 
      });
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleCountryChange = useCallback((countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onCountriesChange(selectedCountries.filter(code => code !== countryCode));
    } else if (selectedCountries.length < maxSelections) {
      onCountriesChange([...selectedCountries, countryCode]);
    }
  }, [selectedCountries, onCountriesChange, maxSelections]);

  if (state.isLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading countries...</div>;
  }

  if (state.error) {
    return <div className="text-red-500">{state.error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {state.countries.map((country) => (
          <button
            key={country.country_code}
            onClick={() => handleCountryChange(country.country_code)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCountries.includes(country.country_code)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            } ${
              selectedCountries.length >= maxSelections &&
              !selectedCountries.includes(country.country_code)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={
              selectedCountries.length >= maxSelections &&
              !selectedCountries.includes(country.country_code)
            }
          >
            {country.country_name}
          </button>
        ))}
      </div>
      {selectedCountries.length >= maxSelections && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Maximum {maxSelections} countries can be selected at once
        </p>
      )}
    </div>
  );
};

export default CountrySelect; 