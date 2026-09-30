"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";

export type CalendarProps = Omit<DayPickerProps, "locale">;

export function Calendar(props: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      weekStartsOn={0}
      showOutsideDays
      className="cc-calendar"
      classNames={{
        root: "cc-calendar-root",
        months: "cc-calendar-months",
        month: "cc-calendar-month",
        month_caption: "cc-calendar-caption",
        caption_label: "cc-calendar-caption-label",
        nav: "cc-calendar-nav",
        button_previous: "cc-calendar-nav-button cc-calendar-prev",
        button_next: "cc-calendar-nav-button cc-calendar-next",
        month_grid: "cc-calendar-grid",
        weekdays: "cc-calendar-weekdays",
        weekday: "cc-calendar-weekday",
        weeks: "cc-calendar-weeks",
        week: "cc-calendar-week",
        day: "cc-calendar-day",
        day_button: "cc-calendar-day-button",
        today: "cc-calendar-today",
        selected: "cc-calendar-selected",
        outside: "cc-calendar-outside",
        disabled: "cc-calendar-disabled",
        hidden: "cc-calendar-hidden",
      }}
      {...props}
    />
  );
}
