import React from "react";
import { NavBar, SafeArea, Slider, setDefaultConfig, Collapse, Space } from "antd-mobile";
import { useTranslation } from "react-i18next";
import zhCN from 'antd-mobile/es/locales/zh-CN'
import enUS from 'antd-mobile/es/locales/en-US'
import "./App.css";

function App() {
  const { t, i18n } = useTranslation();

  // switch language
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setDefaultConfig({
      locale: lng === 'zh' ? zhCN : enUS,
    })
  };

  return (
    <div>
      <div style={{ background: '#ace0ff' }}>
        <SafeArea position="top" />
      </div>
      <NavBar back={null} right={<Space></Space>}>
        {t("title")}
      </NavBar>
      <Slider popover step={0.1} max={100} min={0} />
      <Collapse defaultActiveKey={['1', '2', '3']}>
        <Collapse.Panel key='1' title={t("Hong Kong Stock")}>

        </Collapse.Panel>
        <Collapse.Panel key='2' title={t("US Stock")}>

        </Collapse.Panel>
        <Collapse.Panel key='3' title={t("A Share")}>

        </Collapse.Panel>
      </Collapse>
      <div style={{ background: '#ffcfac' }}>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
}

export default App;
