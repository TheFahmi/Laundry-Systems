import moment from 'moment';
import 'moment/locale/id';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

// Initialize moment with Indonesian locale
moment.locale('id');

// Export adapter class (bukan instance) untuk digunakan di LocalizationProvider
export { AdapterMoment };

// Helper functions for working with dates
export const formatDate = (date: string | Date, format: string = 'DD MMMM YYYY') => {
  return moment(date).format(format);
};

export const formatDateTime = (date: string | Date, format: string = 'DD MMMM YYYY, HH:mm') => {
  return moment(date).format(format);
};

export const formatRelativeTime = (date: string | Date) => {
  return moment(date).fromNow();
};

export const addDays = (date: string | Date, days: number) => {
  return moment(date).add(days, 'days').toDate();
};

export const getDaysBetween = (startDate: string | Date, endDate: string | Date) => {
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'days');
}; 