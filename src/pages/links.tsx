import React from "react";
import { List, Popup } from 'antd-mobile';
import { useTranslation } from "react-i18next";
import "../style/index.scss";

interface DataRow {
  link: string,
}

export default function Links() {
  const { t } = useTranslation();
  const links = [
    {
      header: t('Financial Websites'),
      data: [{
        name: t('Yahoo Finance'),
        link: 'https://finance.yahoo.com/',
      }, {
        name: t('Seeking Alpha'),
        link: 'https://seekingalpha.com/',
      }]
    },
    {
      header: t('Investing Indicators'),
      data: [{
        name: t('US 10-Year Treasury Bond'),
        link: 'https://www.investing.com/rates-bonds/u.s.-10-year-bond-yield',
      }, {
        name: t('Crude Oil Futures'),
        link: 'https://www.investing.com/commodities/brent-oil',
      }, {
        name: t('Gold Futures'),
        link: 'https://www.investing.com/commodities/gold',
      }, {
        name: t('Nasdaq 100'),
        link: 'https://www.investing.com/indices/nq-100',
      }]
    },
    {
      header: t('Economic Websites'),
      data: [{
        name: t('US Bureau of Labor Statistics'),
        link: 'https://www.bls.gov',
      }, {
        name: t('US Bureau of Economic Analysis'),
        link: 'https://www.bea.gov',
      }, {
        name: t('US Federal Reserve System'),
        link: 'https://www.federalreserve.gov',
      }, {
        name: t('US Department of the Treasury'),
        link: 'https://home.treasury.gov',
      }, {
        name: t('US Office of the United States Trade Representative'),
        link: 'https://ustr.gov',
      }]
    },
    {
      header: t('News Websites'),
      data: [{
        name: t('Reuters'),
        link: 'https://www.reuters.com/',
      }, {
        name: t('The Wall Street Journal'),
        link: 'https://www.wsj.com/',
      }, {
        name: t('CNN'),
        link: 'https://www.cnn.com/',
      }, {
        name: t('Bloomberg'),
        link: 'https://www.bloomberg.com/',
      },]
    },
  ];

  // 点击
  const handleClick = (link: string) => {
    window.open(link, '_blank');
  }

  return <div className="content">
    {
      links.map((item, key) => {
        return <List mode="card" header={item.header} key={key} className="link-list-card">
          {item.data.map((i, k) => {
            return <List.Item key={k} onClick={() => { handleClick(i.link || '') }}>{i.name}</List.Item>
          })}
        </List>;
      })
    }
  </div>;
}