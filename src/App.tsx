import React, { useState, useLayoutEffect, useEffect } from "react";
import { NavBar, SafeArea, Slider, setDefaultConfig, CalendarPicker, Form } from "antd-mobile";
import { useTranslation } from "react-i18next";
import zhCN from 'antd-mobile/es/locales/zh-CN'
import enUS from 'antd-mobile/es/locales/en-US'
import moment from 'moment-timezone';
import { debounce } from 'lodash';
import darkLanguageIcon from './images/dark-language-icon.svg';
import lightLanguageIcon from './images/light-language-icon.svg';
import darkModeIcon from './images/dark-mode.svg';
import lightModeIcon from './images/light-mode.svg';
import "./style/index.scss";
import TableCard from "./components/tableCard";
const dateFormat = 'YYYY-MM-DD';
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
moment.tz.setDefault(userTimezone);

// get target rate
const TargetRate = localStorage.getItem('Target-Rate');
// set target rate
const setTargetRateLocal = debounce((value) => {
  localStorage.setItem('Target-Rate', String(value))
}, 300);

// Language
const Language = localStorage.getItem('Language');

function App() {
  const { t, i18n } = useTranslation();
  const [languageMode, setLanguageMode] = useState<string>(Language || 'zh');
  const [enableDarkMode, setEnableDarkMode] = useState<boolean>(false)
  // target annualized rate of return
  const [targetRate, setTargetRate] = useState<number>(TargetRate ? parseInt(TargetRate, 10) : 0);
  // date
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false)
  const [date, setDate] = useState<string>(moment().format(dateFormat))

  // switch languageMode
  const changeLanguage = () => {
    const lang = languageMode === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(lang);
    setDefaultConfig({
      locale: languageMode === 'zh' ? enUS : zhCN,
    })
    setLanguageMode(lang)
    localStorage.setItem('Language', lang);
  };

  useEffect(()=>{
    if (languageMode) {
      i18n.changeLanguage(languageMode);
      setDefaultConfig({
        locale: languageMode === 'zh' ?  zhCN : enUS,
      })
    }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      'data-prefers-color-scheme',
      enableDarkMode ? 'dark' : 'light'
    )
  }, [enableDarkMode])

  return (
    <div className="app">
      <div style={{ background: '#ace0ff' }}>
        <SafeArea position="top" />
      </div>
      <NavBar className="navigator"
        back={null}
        right={<div className="title-right">
          <div className="button" onClick={changeLanguage}>
            <img src={enableDarkMode ? darkLanguageIcon : lightLanguageIcon} />
          </div>
          <div className="button" onClick={() => {
            setEnableDarkMode(!enableDarkMode)
          }}>
            <img src={enableDarkMode ? darkModeIcon : lightModeIcon} />
          </div>
        </div>
        }>
        <div>
          <div className="title">{t("Title")}</div>
          <div className='subtitle'>{t("Subtitle")}</div>
        </div>
      </NavBar>
      <div className="body">
        <Form>
          <Form.Item label={`${t('Target Date')}`} trigger='onConfirm' arrow={true} onClick={() => {
            setDatePickerVisible(true)
          }}>
            <CalendarPicker
              min={new Date(date)}
              max={new Date(new Date(date).setFullYear(new Date(date).getFullYear() + 2))}
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
          <Form.Item label={`${t('Target Annualized Rate of Return')}: ${targetRate}%`}>
            <Slider popover step={0.1} max={100} min={0}
              value={targetRate}
              onChange={v => {
                const value = typeof v === 'number' ? v : 0;
                setTargetRate(value);
                setTargetRateLocal(value);
              }}
            />
          </Form.Item>
        </Form>
        <TableCard title={`🇨🇳 ${t("A Share")}`} ID={"CHN"} targetDate={date}></TableCard>
        <TableCard title={`🇺🇸 ${t("US Stock")}`} ID={"US"} targetDate={date}></TableCard>
        <TableCard title={`🇭🇰 ${t("Hong Kong Stock")}`} ID={"HK"} targetDate={date}></TableCard>
      </div>
      <div style={{ background: '#ffcfac' }}>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
}

export default App;
