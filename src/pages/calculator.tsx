import React, { useState } from "react";
import { Slider, CalendarPicker, Form } from "antd-mobile";
import { useTranslation } from "react-i18next";
import moment from 'moment-timezone';
import { debounce } from 'lodash';
import "../style/index.scss";
import TableCard from "../components/tableCard";
const dateFormat = 'YYYY-MM-DD';
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
moment.tz.setDefault(userTimezone);

// get expected rate
const ExpectedRate = localStorage.getItem('Expected-Rate');

export default function Calculator() {
  const { t } = useTranslation();
  // expected annualized rate of return
  const [expectedRate, setExpectedRate] = useState<number>(ExpectedRate ? parseInt(ExpectedRate, 10) : 0);
  // date
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false)
  const [date, setDate] = useState<string>(moment().format(dateFormat))
  // set expected rate
  const setExpectedRateByDebounce = debounce((value) => {
    setExpectedRate(value);
    localStorage.setItem('Expected-Rate', String(value))
  }, 300);

  return <div className="content">
    <Form>
      <Form.Item label={`${t('Expected Date')}`} trigger='onConfirm' arrow={true} onClick={() => {
        setDatePickerVisible(true)
      }}>
        <CalendarPicker
          min={new Date()}
          max={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
          visible={datePickerVisible}
          selectionMode='single'
          defaultValue={new Date(date)}
          onClose={() => setDatePickerVisible(false)}
          onMaskClick={() => setDatePickerVisible(false)}
          onConfirm={val => {
            setDate(moment(val).format(dateFormat));
          }}
        />
        {date}
      </Form.Item>
      <Form.Item label={`${t('Expected Annualized Rate of Return')}: ${expectedRate}%`}>
        <Slider popover step={0.1} max={100} min={0}
          defaultValue={expectedRate}
          onChange={v => {
            const value = typeof v === 'number' ? v : 0;
            setExpectedRateByDebounce(value);
          }}
        />
      </Form.Item>
    </Form>
    <TableCard title={`🇨🇳 ${t("A Share")}`} ID={"CHN"} expectedDate={date} expectedRate={expectedRate}></TableCard>
    <TableCard title={`🇺🇸 ${t("US Stock")}`} ID={"US"} expectedDate={date} expectedRate={expectedRate}></TableCard>
    <TableCard title={`🇭🇰 ${t("Hong Kong Stock")}`} ID={"HK"} expectedDate={date} expectedRate={expectedRate}></TableCard>
  </div>
}