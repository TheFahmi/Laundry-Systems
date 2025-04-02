import React, { useState, useEffect } from 'react';
import { format, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BottomSheet from './BottomSheet';

interface DatePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
  description?: string;
  disabledDates?: Date[];
  // For delivery date selection, you need a minimum interval after pickup
  minIntervalAfterDate?: {
    date: Date;
    days: number;
  };
  holidayDates?: Record<string, string>;
}

export default function DatePickerSheet({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  minDate = new Date(),
  maxDate,
  title = "Pilih Tanggal",
  description = "Silakan pilih tanggal yang diinginkan",
  disabledDates = [],
  minIntervalAfterDate,
  holidayDates = {}
}: DatePickerSheetProps) {
  // State to track the displayed month/year as the user navigates
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || minDate || new Date()
  );
  
  // Calculate all days to display for the current month view
  const [daysInView, setDaysInView] = useState<Date[]>([]);

  // Generate array of dates to display
  useEffect(() => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Add days from previous month to start on Monday (or the appropriate first day of week)
    const daysToAddFromPrevMonth = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
    const firstViewDate = new Date(startDate);
    firstViewDate.setDate(firstViewDate.getDate() - daysToAddFromPrevMonth);
    
    // Add days from next month to complete the grid
    const daysToAddFromNextMonth = (7 - endDate.getDay()) % 7;
    const lastViewDate = new Date(endDate);
    lastViewDate.setDate(lastViewDate.getDate() + daysToAddFromNextMonth);
    
    // Generate all days in the view
    const days: Date[] = [];
    let currentDay = new Date(firstViewDate);
    
    while (isBefore(currentDay, lastViewDate) || isSameDay(currentDay, lastViewDate)) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    setDaysInView(days);
  }, [currentMonth]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Check if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    // Disable dates before minDate
    if (minDate && isBefore(date, new Date(minDate.setHours(0, 0, 0, 0)))) {
      return true;
    }
    
    // Disable dates after maxDate
    if (maxDate && isAfter(date, new Date(maxDate.setHours(23, 59, 59, 999)))) {
      return true;
    }
    
    // Disable dates in the disabledDates array
    if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) {
      return true;
    }
    
    // Disable dates that don't meet the minimum interval from a reference date
    if (minIntervalAfterDate && minIntervalAfterDate.date) {
      const minAllowedDate = addDays(minIntervalAfterDate.date, minIntervalAfterDate.days);
      if (isBefore(date, minAllowedDate)) {
        return true;
      }
    }
    
    return false;
  };

  // Check if a date is a holiday
  const isHoliday = (date: Date): string | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidayDates[dateStr] || null;
  };

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    if (!isDateDisabled(date)) {
      onSelect(date);
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
    >
      <div className="px-4 py-2">
        {/* Month navigation */}
        <div className="flex justify-between items-center mb-4 bg-primary/10 rounded-lg p-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary/20"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary/20"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
            <div
              key={day}
              className={`py-1 ${i === 6 ? 'text-red-500' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInView.map((date, i) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const disabled = isDateDisabled(date);
            const holiday = isHoliday(date);
            const selected = selectedDate ? isSameDay(date, selectedDate) : false;
            const current = isToday(date);
            
            return (
              <button
                key={i}
                onClick={() => handleSelectDate(date)}
                disabled={disabled}
                className={`
                  h-10 w-full flex flex-col items-center justify-center relative
                  rounded-md text-sm
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${disabled ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed' : 'cursor-pointer hover:bg-primary/10'}
                  ${selected ? 'bg-primary text-white hover:bg-primary' : ''}
                  ${current && !selected ? 'border border-primary/50 bg-primary/5' : ''}
                  ${holiday && !disabled && !selected ? 'bg-orange-50 text-orange-600' : ''}
                `}
              >
                <span>{date.getDate()}</span>
                {holiday && !disabled && (
                  <span className="absolute bottom-0 left-0 right-0 w-full h-1 bg-orange-400 rounded-b-md" />
                )}
              </button>
            );
          })}
        </div>

        {/* Delivery time notice */}
        {minIntervalAfterDate && (
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 overflow-hidden">
            <div className="p-2 bg-blue-100/50 border-b border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 flex items-center">
                <Clock className="h-4 w-4 text-blue-600 mr-1.5" />
                Informasi Waktu
              </h4>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Estimasi waktu pengerjaan:</span>
                  <span className="ml-1.5 bg-blue-100 text-blue-800 font-medium py-0.5 px-2 rounded-md inline-block">
                    {minIntervalAfterDate.days} hari
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Pengiriman tersedia:</span>
                  <span className="ml-1.5 bg-blue-100 text-blue-800 font-medium py-0.5 px-2 rounded-md inline-block">
                    Minimal {minIntervalAfterDate.days} hari setelah pengambilan
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Holidays legend */}
        {Object.keys(holidayDates).length > 0 && (
          <div className="mt-4 p-2 bg-orange-50 rounded-md border border-orange-100 flex items-start">
            <Calendar className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-700">
              <p className="font-medium mb-1">Hari Libur:</p>
              <ul className="space-y-1">
                {Object.entries(holidayDates).slice(0, 3).map(([date, name]) => (
                  <li key={date} className="flex items-center">
                    <span className="w-4 h-1 bg-orange-400 rounded mr-1" />
                    <span>{format(new Date(date), 'd MMM')} - {name}</span>
                  </li>
                ))}
                {Object.keys(holidayDates).length > 3 && (
                  <li>...dan {Object.keys(holidayDates).length - 3} hari libur lainnya</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
} 