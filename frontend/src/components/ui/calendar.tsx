"use client";

import * as React from "react";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { isSameDay, format } from "date-fns";

// Map of Indonesian holidays with their names
const INDONESIAN_HOLIDAY_NAMES = {
  // 2024 holidays
  "2024-01-01": "Tahun Baru 2024",
  "2024-02-08": "Tahun Baru Imlek 2575",
  "2024-03-11": "Isra Mi'raj Nabi Muhammad SAW",
  "2024-03-29": "Wafat Isa Al Masih",
  "2024-04-10": "Hari Raya Idul Fitri 1445 H",
  "2024-04-11": "Hari Raya Idul Fitri 1445 H",
  "2024-05-01": "Hari Buruh Internasional",
  "2024-05-09": "Hari Raya Waisak 2568",
  "2024-05-23": "Kenaikan Isa Al Masih",
  "2024-06-01": "Hari Lahir Pancasila",
  "2024-06-17": "Hari Raya Idul Adha 1445 H",
  "2024-07-07": "Tahun Baru Islam 1446 H",
  "2024-08-17": "Hari Kemerdekaan RI",
  "2024-09-16": "Maulid Nabi Muhammad SAW",
  "2024-12-25": "Hari Raya Natal",
  // 2025 holidays
  "2025-01-01": "Tahun Baru 2025",
  "2025-01-28": "Tahun Baru Imlek 2576",
  "2025-03-01": "Isra Mi'raj Nabi Muhammad SAW",
  "2025-03-18": "Wafat Isa Al Masih",
  "2025-03-31": "Hari Raya Idul Fitri 1446 H",
  "2025-04-01": "Hari Raya Idul Fitri 1446 H",
  "2025-05-01": "Hari Buruh Internasional",
  "2025-05-29": "Hari Raya Waisak 2569",
  "2025-06-01": "Hari Lahir Pancasila",
  "2025-06-08": "Kenaikan Isa Al Masih",
  "2025-06-07": "Hari Raya Idul Adha 1446 H",
  "2025-07-27": "Tahun Baru Islam 1447 H",
  "2025-08-17": "Hari Kemerdekaan RI",
  "2025-10-05": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",
};

// Indonesian holidays for 2024-2025
const INDONESIAN_HOLIDAYS = [
  // 2024 holidays
  new Date(2024, 0, 1), // New Year
  new Date(2024, 1, 8), // Chinese New Year
  new Date(2024, 2, 11), // Isra Mi'raj
  new Date(2024, 2, 29), // Good Friday
  new Date(2024, 3, 10), // Eid al-Fitr (Lebaran) 1
  new Date(2024, 3, 11), // Eid al-Fitr (Lebaran) 2
  new Date(2024, 4, 1), // Labor Day
  new Date(2024, 4, 9), // Waisak Day
  new Date(2024, 4, 23), // Ascension Day
  new Date(2024, 5, 1), // Pancasila Day
  new Date(2024, 5, 17), // Eid al-Adha
  new Date(2024, 6, 7), // Islamic New Year
  new Date(2024, 7, 17), // Independence Day
  new Date(2024, 8, 16), // Prophet Muhammad's Birthday
  new Date(2024, 11, 25), // Christmas Day
  // 2025 holidays
  new Date(2025, 0, 1), // New Year
  new Date(2025, 0, 28), // Chinese New Year
  new Date(2025, 2, 1), // Isra Mi'raj
  new Date(2025, 3, 18), // Good Friday
  new Date(2025, 2, 31), // Eid al-Fitr (Lebaran) 1
  new Date(2025, 3, 1), // Eid al-Fitr (Lebaran) 2
  new Date(2025, 4, 1), // Labor Day
  new Date(2025, 4, 29), // Waisak Day
  new Date(2025, 5, 1), // Pancasila Day
  new Date(2025, 5, 8), // Ascension Day
  new Date(2025, 5, 7), // Eid al-Adha
  new Date(2025, 6, 27), // Islamic New Year
  new Date(2025, 7, 17), // Independence Day
  new Date(2025, 9, 5), // Prophet Muhammad's Birthday
  new Date(2025, 11, 25), // Christmas Day
];

// Function to check if a date is an Indonesian holiday
function isIndonesianHoliday(date: Date) {
  return INDONESIAN_HOLIDAYS.some(holiday => isSameDay(date, holiday));
}

// Function to get holiday name for a date
function getHolidayName(date: Date): string | null {
  const key = format(date, 'yyyy-MM-dd');
  return INDONESIAN_HOLIDAY_NAMES[key as keyof typeof INDONESIAN_HOLIDAY_NAMES] || null;
}

// Function to check if a date is a Sunday
function isSunday(date: Date) {
  return date.getDay() === 0;
}

// CSS for tooltips - add to your global.css or a style tag in your document
const tooltipStyles = `
.calendar-tooltip {
  position: relative;
}

.calendar-tooltip[data-tooltip]:hover::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: #1f2937;
  color: white;
  font-size: 0.75rem;
  white-space: nowrap;
  border-radius: 4px;
  z-index: 50;
  pointer-events: none;
}

.calendar-tooltip[data-tooltip]:hover::after {
  content: '';
  position: absolute;
  bottom: 95%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #1f2937 transparent transparent transparent;
  z-index: 50;
  pointer-events: none;
}
`;

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Custom modifier to highlight holidays
  const modifiers = {
    holiday: (date: Date) => isIndonesianHoliday(date),
    sunday: (date: Date) => isSunday(date),
  };

  // Custom modifier styles
  const modifiersStyles = {
    holiday: { color: '#e11d48', fontWeight: 'bold' },
    sunday: { color: '#e11d48' },
  };

  React.useEffect(() => {
    // Add the tooltip styles to the document on mount
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .rdp-day {
        position: relative !important;
      }
      
      .rdp-day[data-tooltip]:hover::before {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 8px;
        background-color: #1f2937;
        color: white;
        font-size: 0.75rem;
        white-space: nowrap;
        border-radius: 4px;
        z-index: 50;
        pointer-events: none;
      }
      
      .rdp-day[data-tooltip]:hover::after {
        content: '';
        position: absolute;
        bottom: 95%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 4px;
        border-style: solid;
        border-color: #1f2937 transparent transparent transparent;
        z-index: 50;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleElement);

    // Function to apply tooltips
    const applyTooltips = () => {
      // Use setTimeout to ensure calendar is rendered
      setTimeout(() => {
        const buttons = document.querySelectorAll('.rdp-button');
        buttons.forEach(button => {
          const dateAttr = button.getAttribute('aria-label');
          if (dateAttr) {
            try {
              const date = new Date(dateAttr);
              const holidayName = getHolidayName(date);
              
              if (holidayName) {
                const dayElement = button.closest('.rdp-day');
                if (dayElement) {
                  dayElement.setAttribute('data-tooltip', holidayName);
                }
              } else if (isSunday(date)) {
                const dayElement = button.closest('.rdp-day');
                if (dayElement) {
                  dayElement.setAttribute('data-tooltip', 'Hari Minggu');
                }
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        });
      }, 200);
    };

    // Apply tooltips initially and when month changes
    applyTooltips();

    // Create a mutation observer to watch for calendar changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          applyTooltips();
        }
      }
    });

    // Start observing
    const calendarElement = document.querySelector('.rdp');
    if (calendarElement) {
      observer.observe(calendarElement, { 
        subtree: true,
        childList: true 
      });
    }

    return () => {
      styleElement.remove();
      observer.disconnect();
    };
  }, []);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      weekStartsOn={1}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      disabled={[
        { dayOfWeek: [0] } // Only disable Sundays
      ]}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center bg-primary/10 rounded-t-lg p-2",
        caption_label: "text-sm font-medium text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-primary"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative h-10 w-10 p-0 text-center cursor-pointer",
        day: cn(
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground cursor-pointer"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50 bg-gray-100",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          return orientation === 'left' 
            ? <ChevronLeft className="h-4 w-4" /> 
            : <ChevronRight className="h-4 w-4" />;
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

// Simple icon components
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
} 