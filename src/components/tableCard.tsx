import React, { useState, RefObject, useEffect } from 'react';
import { AddCircleOutline, MailOpenOutline, ExclamationCircleOutline } from 'antd-mobile-icons'
import { Card, Form, Popup, Button, Input, Stepper, DatePicker, Empty, Dialog, Popover } from 'antd-mobile'
import { useTranslation } from "react-i18next";
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import type { DatePickerRef } from 'antd-mobile/es/components/date-picker'
import './index.scss';
import calculator from '../libs/calculator';

const dateFormat = 'YYYY-MM-DD';
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
moment.tz.setDefault(userTimezone);

interface NumberIndexed {
  [key: string]: string;
}

const currencyUnitMap: NumberIndexed = {
  "CHN": 'CNY',
  "US": 'USD',
  "HK": 'HKU'
}

interface DataRow {
  ID: string,
  stockName: string,
  costPrice: number,
  quantity: number,
  purchaseTime: string | null | Date,
  platformFee: number,
  expectedPrice?: number,
}

const defaultData: DataRow = {
  ID: '',
  stockName: '',
  costPrice: 0,
  quantity: 0,
  purchaseTime: null,
  platformFee: 0,
};

interface Props {
  ID: string,
  title: string,
  expectedDate: string,
  expectedRate: number,
}

const TableCard: React.FC<Props> = ({
  ID = "",
  title = "",
  expectedDate = "",
  expectedRate = 0,
}) => {
  const date = moment().format(dateFormat);
  const { t } = useTranslation();
  // get local stock data
  const stockData = localStorage.getItem(`StockList-${ID}`);
  let list = [];
  if (stockData) {
    list = JSON.parse(stockData);
  }
  const [dataList, setDataList] = useState<DataRow[]>(list);
  // row data popup layer
  const [rowPopupVisible, setRowPopupVisible] = useState<boolean>(false);
  const [rowPopupType, setRowPopupType] = useState<string>('Add');
  const [rowPopupData, setRowPopupData] = useState<DataRow>(defaultData);
  const [form] = Form.useForm()
  // tips popup layer
  const [tipsPopupVisible, setTipsPopupVisible] = useState<boolean>(false);
  // popover
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const handleRowPopup = async (type: string, data?: DataRow) => {
    switch (type) {
      case 'Add': {
        form.setFieldsValue(defaultData);
        setRowPopupData(defaultData);
        setRowPopupVisible(true);
        setRowPopupType(type);
        break;
      }
      case 'Edit': {
        const editData = { ...defaultData, ...data };
        delete editData.expectedPrice;
        editData.purchaseTime = new Date(String(editData.purchaseTime));
        form.setFieldsValue(editData);
        setRowPopupData(editData)
        setRowPopupVisible(true);
        setRowPopupType(type);
        break;
      }
      case 'DELETE': {
        const result = await Dialog.confirm({
          content: `${t('Confirm to delete')} ${data?.stockName} ?`,
        })
        if (result && data) {
          const newData = dataList.filter(item => item.ID !== data.ID);
          setDataList(newData);
          localStorage.setItem(`StockList-${ID}`, JSON.stringify(newData));
        }
        break;
      }
    }
  }

  // close row data popup
  const onRowDataClose = () => {
    setRowPopupVisible(false);
    setRowPopupData(defaultData);
    form.setFieldsValue(defaultData);
  }

  // close tips popup
  const onTipsClose = () => {
    setTipsPopupVisible(false);
  }

  // submit
  const onFinish = () => {
    const values = form.getFieldsValue()
    if (rowPopupType === 'Add') {
      const newRow: DataRow = {
        ID: uuidv4(),
        ...values,
        purchaseTime: moment(values.purchaseTime).format(dateFormat),
        // @ts-ignore
        expectedPrice: calculator({
          type: ID,
          startDate: values.purchaseTime,
          endDate: expectedDate,
          expectedYearRate: expectedRate,
          costPrice: values.costPrice,
          quantity: values.quantity,
          platformFee: values.platformFee,
        })
      };
      const newList = [...dataList, newRow];
      setDataList(newList);
      localStorage.setItem(`StockList-${ID}`, JSON.stringify(newList));
    } else if (rowPopupType === 'Edit') {
      const index = dataList.findIndex(item => item.ID === rowPopupData.ID);
      const editList = [...dataList];
      if (index !== -1) {
        editList[index] = {
          ...dataList[index],
          ...values,
          purchaseTime: moment(values.purchaseTime).format(dateFormat),
          // @ts-ignore
          expectedPrice: calculator({
            type: ID,
            startDate: moment(values.purchaseTime).format(dateFormat),
            endDate: expectedDate,
            expectedYearRate: expectedRate,
            costPrice: values.costPrice,
            quantity: values.quantity,
            platformFee: values.platformFee,
          })
        };
      }
      setDataList(editList);
      localStorage.setItem(`StockList-${ID}`, JSON.stringify(editList));
    }
    setRowPopupVisible(false);
    form.setFieldsValue(defaultData);
    setRowPopupData(defaultData);
  }

  useEffect(() => {
    const calculatedList = dataList.map(item => ({
      ...item,
      // @ts-ignore
      expectedPrice: calculator({
        type: ID,
        startDate: item.purchaseTime,
        endDate: expectedDate,
        expectedYearRate: expectedRate,
        costPrice: item.costPrice,
        quantity: item.quantity,
        platformFee: item.platformFee,
      })
    }))
    setDataList(calculatedList);
  }, [expectedDate, expectedRate])

  return (
    <Card className="card"
      title={`${title} (${currencyUnitMap[ID]})`}
      extra={<div className='card-title-right'>
        {/* <TextOutline fontSize={20} color='var(--adm-color-primary)'
          onClick={() => {
            setTipsPopupVisible(true);
          }}
        /> */}
        <AddCircleOutline
          fontSize={20}
          color='var(--adm-color-primary)'
          onClick={() => {
            handleRowPopup('Add')
          }}
        />
      </div>
      }>
      {dataList.length > 0 ? <div className="table-container">
        <div className="fixed-column">
          <table>
            <thead>
              <tr>
                <th>{t('Stock Name')}</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((row) => (
                <tr key={row.ID}>
                  <td>{row.stockName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="scrollable">
          <table>
            <thead>
              <tr>
                <th>{t('Cost Price')}</th>
                <th>{t('Quantity')}</th>
                <th>{t('Purchase Time')}</th>
                <th>{t('Platform Fee')}</th>
                <th>
                  <div className='table-title'>
                    {t('Expected Price')}
                    <Popover
                      content={t('The stock price needed to be sold to meet the target annualized rate of return')}
                      trigger='click'
                      placement='top'
                      mode='dark'
                      defaultVisible={false}
                      >
                        <ExclamationCircleOutline />
                    </Popover>
                  </div>
                </th>
                <th>{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((row) => (
                <tr key={row.ID}>
                  <td>{row.costPrice}</td>
                  <td>{row.quantity}</td>
                  <td>{moment(row.purchaseTime).format(dateFormat)}</td>
                  <td>{row.platformFee}</td>
                  <td>{row.expectedPrice}</td>
                  <td>{<div className='action'>
                    <a onClick={() => {
                      handleRowPopup('Edit', row);
                    }}>{t('Edit')}</a>
                    <a style={{ color: '#FF0000' }} onClick={() => {
                      handleRowPopup('DELETE', row);
                    }}>{t('Delete')}</a>
                  </div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> : <Empty
        image={<MailOpenOutline color='var(--adm-color-weak)' style={{ fontSize: 36 }} />}
        description={t('No Data')}
      />
      }
      <Popup
        visible={rowPopupVisible}
        onMaskClick={onRowDataClose}
        onClose={onRowDataClose}
        showCloseButton={true}
      >
        <div className='popup-title'>{`${t(rowPopupType)}${t('Stock')}`}</div>
        <Form
          form={form}
          initialValues={rowPopupData}
          footer={
            <div className='popup-button'>
              <Button block type='submit' color='primary' size='middle'>
                {t('Submit')}
              </Button>
              <Button block color='default' size='middle' onClick={onRowDataClose}>
                {t('Cancel')}
              </Button>
            </div>
          }
          onFinish={onFinish}
        >
          <Form.Item
            name='stockName'
            label={t('Stock Name')}
            rules={[{ required: true, message: `${t('Please Enter')}${t('Stock Name')}` }]}
          >
            <Input maxLength={10} placeholder={`${t('Please Enter')}${t('Stock Name')}`} />
          </Form.Item>
          <Form.Item
            name='costPrice'
            label={`${t('Cost Price')} (${currencyUnitMap[ID]})`}
            rules={[{ required: true, message: `${t('Please Enter')}${t('Cost Price')}` }]}
          >
            <Stepper min={0} digits={3} step={0.001} max={1000000} style={{ '--height': '36px', width: '100%' }} />
          </Form.Item>
          <Form.Item
            name='quantity'
            label={t('Quantity')}
            rules={[{ required: true, message: `${t('Please Enter')}${t('Cost Price')}` }]}
          >
            <Stepper min={0} digits={0} step={1} style={{ '--height': '36px', width: '100%' }} />
          </Form.Item>
          <Form.Item
            name='purchaseTime'
            label={t('Purchase Time')}
            rules={[{ required: true, message: `${t('Please Enter')}${t('Purchase Time')}` }]}
            trigger='onConfirm'
            arrow={true}
            onClick={(e, datePickerRef: RefObject<DatePickerRef>) => {
              datePickerRef.current?.open();
            }}
          >
            <DatePicker max={new Date(date)} mouseWheel={true}>
              {value =>
                value ? moment(value).format('YYYY-MM-DD')
                  : <div className='placeholder'>{`${t('Please Enter')}${t('Purchase Time')}`}</div>
              }
            </DatePicker>
          </Form.Item>
          <Form.Item
            name='platformFee'
            label={`${t('Platform Fee')} (${currencyUnitMap[ID]})`}
          >
            <Stepper min={0} digits={2} step={0.01} style={{ '--height': '36px', width: '100%' }} />
          </Form.Item>
        </Form>
      </Popup>
      <Popup
        visible={tipsPopupVisible}
        onMaskClick={onTipsClose}
        onClose={onTipsClose}
        showCloseButton={true}
      >
        {/* <div className='popup-title'>{t('Fee Calculation Formula')}</div> */}
      </Popup>
    </Card>
  );
};

export default TableCard;
