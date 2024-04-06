import React, { useState, useLayoutEffect, useEffect } from "react";
import { NavBar, SafeArea, setDefaultConfig, TabBar, Footer } from "antd-mobile";
import { CalculatorOutline, FileOutline } from 'antd-mobile-icons'
import { useTranslation } from "react-i18next";
import zhCN from 'antd-mobile/es/locales/zh-CN'
import enUS from 'antd-mobile/es/locales/en-US'
import moment from 'moment-timezone';
import darkLanguageIcon from './images/dark-language-icon.svg';
import lightLanguageIcon from './images/light-language-icon.svg';
import darkModeIcon from './images/dark-mode.svg';
import lightModeIcon from './images/light-mode.svg';
import "./style/index.scss";
import Calculator from './pages/calculator';
import Links from './pages/links';
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
moment.tz.setDefault(userTimezone);

// get language mode
const Language = localStorage.getItem('Language');

function App() {
  const { t, i18n } = useTranslation();
  const tabs = [
    {
      key: 'calculator',
      title: t('Calculator'),
      icon: <CalculatorOutline />,
    },
    {
      key: 'links',
      title: t('Links'),
      icon: <FileOutline />,
    },
  ]

  const [languageMode, setLanguageMode] = useState<string>(Language || 'zh');
  const [enableDarkMode, setEnableDarkMode] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('calculator');

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

  useEffect(() => {
    if (languageMode) {
      i18n.changeLanguage(languageMode);
      setDefaultConfig({
        locale: languageMode === 'zh' ? zhCN : enUS,
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
    <>
      <div className={`app ${enableDarkMode ? 'dark' : 'light'}`}>
        <div>
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
          {activeKey === 'calculator' ? <Calculator /> : <></>}
          {activeKey === 'links' ? <Links /> : <></>}
          <Footer content={
            <p className="footer">
          	  <span id="busuanzi_container_site_pv">PV: <span id="busuanzi_value_site_pv"></span></span>
				      <span id="busuanzi_container_site_uv">UV: <span id="busuanzi_value_site_uv"></span></span>
            </p>
          }></Footer>
        </div>
        <TabBar className="tab-bar" activeKey={activeKey} onChange={value => setActiveKey(value)}>
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
        <div>
          <SafeArea position='bottom' />
        </div>
      </div>
    </>
  );
}

export default App;
