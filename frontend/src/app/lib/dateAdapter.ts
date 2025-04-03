import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import enUS from 'date-fns/locale/en-US';

// Export en-US locale directly to avoid import issues
export { enUS };

// Create a custom adapter instance
export const dateAdapter = new AdapterDateFns({ locale: enUS }); 