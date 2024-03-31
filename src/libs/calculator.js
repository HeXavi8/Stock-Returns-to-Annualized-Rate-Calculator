const Decimal = require('decimal.js');
const moment = require('moment');
// HK
function calculateTotalCostHK(transactionAmount, platformFee) {
  // CCASS Fee
  const settlementFeeRate = new Decimal('0.00002');
  const minSettlementFee = new Decimal('2');
  const maxSettlementFee = new Decimal('100');
  // Stamp Duty
  const stampDutyRate = new Decimal('0.001');
  const minStampDutyRate = new Decimal('1');
  // Trading Fee
  const tradingFeeRate = new Decimal('0.0000565');
  const minTradingFee = new Decimal('0.01');
  // Transaction Levy
  const tradingLevyRate = new Decimal('0.000027');
  const minTradingLevy = new Decimal('0.01');
  // FRC Transaction Levy
  const financialReportingLevyRate = new Decimal('0.0000015');
  const minFinancialReportingLevy = new Decimal('0.01');

  const settlementFee = Decimal.min(Decimal.max(transactionAmount.mul(settlementFeeRate), minSettlementFee), maxSettlementFee);
  const stampDuty = Decimal.max(transactionAmount.mul(stampDutyRate), minStampDutyRate);
  const tradingFee = Decimal.max(transactionAmount.mul(tradingFeeRate), minTradingFee);
  const tradingLevy = Decimal.max(transactionAmount.mul(tradingLevyRate), minTradingLevy);
  const financialReportingLevy = Decimal.max(transactionAmount.mul(financialReportingLevyRate), minFinancialReportingLevy);

  // total cost
  const totalCost = settlementFee.add(stampDuty).add(tradingFee).add(tradingLevy).add(financialReportingLevy).add(platformFee);

  return totalCost.toFixed(2);
}

// US
function calculateTotalCostUS(transactionAmount, shareQuantity, platformFee, isSell) {
  // Settlement Fee
  const settlementFeeRate = new Decimal('0.003');
  const maxSettlementFeePercentage = new Decimal('0.07');
  // SEC Fee
  const secFeeRate = new Decimal('0.000008');
  const minSecFee = new Decimal('0.01');
  // Trading Activity Fee
  const activityFeeRate = new Decimal('0.000166');
  const minActivityFee = new Decimal('0.01');
  const maxActivityFee = new Decimal('8.30');

  const settlementFee = Decimal.min(shareQuantity.mul(settlementFeeRate), transactionAmount.mul(maxSettlementFeePercentage));
  const secFee = isSell ? Decimal.max(transactionAmount.mul(secFeeRate), minSecFee) : new Decimal(0);
  let activityFee = isSell ? Decimal.min(shareQuantity.mul(activityFeeRate), maxActivityFee) : new Decimal(0);
  activityFee = Decimal.max(activityFee, minActivityFee);

  // Total Cost
  const totalCost = settlementFee.add(secFee).add(activityFee).add(platformFee);

  return totalCost.toFixed(2);
}

// CHN
function calculateTotalCostCHN(transactionAmount, platformFee, isSell) {
  // Commission Free
  const commissionRate = new Decimal('0.0003');
  const minCommission = new Decimal('5');
  // Stamp Duty
  const stampDutyRate = new Decimal('0.0005');
  // Transfer Free
  const transferFeeRate = new Decimal('0.00001');
  const minTransferFee = new Decimal('1');

  const commission = Decimal.max(new Decimal(transactionAmount).mul(commissionRate), minCommission);
  const stampDuty = isSell ? new Decimal(transactionAmount).mul(stampDutyRate) : new Decimal(0);
  const transferFee = Decimal.max(new Decimal(transactionAmount).mul(transferFeeRate), minTransferFee);

  // Total Cost
  let totalCost = commission.add(stampDuty).add(transferFee).add(platformFee);

  return totalCost.toFixed(2);
}

/**
 * Calculate the expected profit of holding assets to the target annualized rate of return.
 * @param {string} type The type of asset, such as CHN A share
 * @param {Date} startDate The start date of holding assets.
 * @param {Date} endDate The end date of holding assets.
 * @param {number} expectedYearRate The target annualized rate of return, represented as a decimal, e.g., 10% for 0.1.
 * @param {number} costPrice The purchase price of the asset.
 * @param {number} quantity The quantity of the asset.
 * @param {number} platformFee The platform transaction fee, in currency units, e.g., dollars.
 * @returns {number} The expected profit price, in currency units, e.g., dollars.
 * @description
 * This function is used to calculate the expected profit of holding assets to the target annualized rate of return.
 * The calculation formula is as follows:
 * sellTransactionAmount - sellCost(SellTransactionAmount) = realExpectedMoney + purchaseTransactionAmount + purchaseCost(purchaseTransactionAmount)
 * where realExpectedMoney = (purchaseTransactionAmount * yearRate * days) / 365
 */

function calculator({
  type,
  startDate,
  endDate,
  expectedYearRate,
  costPrice,
  quantity,
  platformFee,
}) {
  // console.log({
  //   type,
  //   startDate,
  //   endDate,
  //   expectedYearRate,
  //   costPrice,
  //   quantity,
  //   platformFee,
  // });
  let result = 0;
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);
  const days = endMoment.diff(startMoment, 'days');
  const yearRate = new Decimal(expectedYearRate / 100);
  const purchasePrice = new Decimal(costPrice);
  const stockQuantity = new Decimal(quantity);
  const stockPlatformFee = new Decimal(platformFee);
  const purchaseTransactionAmount = purchasePrice.mul(stockQuantity);
  const realExpectedMoney = purchaseTransactionAmount.mul(yearRate.mul(days)).div('365').toDecimalPlaces(2);
  /**
   * Binary search to find a value with precision up to two decimal places.
   * @param {number} left The left bound of the search range.
   * @param {number} right The right bound of the search range.
   * @param {number} target The target value to find.
   * @returns {number|null} If the target value is found, returns the value rounded to two decimal places; otherwise returns null.
  */
  function binarySearch(l, r, target) {
    const precision = 0.001;
    let result = r;
    if (r.minus(l) <= new Decimal(precision)) {
      // console.log(Number(r), Number(l));
      return r;
    }
    if (l.cmp(r) !== 1) {
      // Calculate the mid value
      const left = new Decimal(l).toDecimalPlaces(4);
      const right = new Decimal(r).toDecimalPlaces(4);
      const middle = (right.add(left)).div(2).toDecimalPlaces(4);
      const sellTransactionAmount = middle.mul(stockQuantity);
      let sellCost = new Decimal(0);
      switch(type) {
        case 'CHN': {
          sellCost = calculateTotalCostCHN(sellTransactionAmount, stockPlatformFee, true);
          break;
        }
        case 'US': {
          sellCost = calculateTotalCostUS(sellTransactionAmount, stockQuantity, stockPlatformFee, true);
          break;
        }
        case 'HK': {
          sellCost = calculateTotalCostHK(sellTransactionAmount, stockPlatformFee);
          break;
        }
      }
      if (sellTransactionAmount.minus(sellCost).cmp(target) === 1) {
        result = binarySearch(left, middle, target);
      } else {
        result = binarySearch(middle, right, target);
      }
    }
    return result;
  }
  switch (type) {
    case 'CHN': {
      const purchaseCost = calculateTotalCostCHN(purchaseTransactionAmount, stockPlatformFee, false);
      const target = realExpectedMoney.add(purchaseCost).add(purchaseTransactionAmount);
      const sellPrice = binarySearch(purchasePrice, purchasePrice.add(1000), target);
      result = Math.ceil(sellPrice * 100) / 100;
      break;
    }
    case 'HK': {
      const purchaseCost = calculateTotalCostHK(purchaseTransactionAmount, stockPlatformFee);
      const target = realExpectedMoney.add(purchaseCost).add(purchaseTransactionAmount);
      const sellPrice = binarySearch(purchasePrice, purchasePrice.add(1000), target);
      result = Math.floor(sellPrice * 100) / 100;
      break;
    }
    case 'US': {
      const purchaseCost = calculateTotalCostUS(purchaseTransactionAmount, stockQuantity, stockPlatformFee, false);
      const target = realExpectedMoney.add(purchaseCost).add(purchaseTransactionAmount);
      const sellPrice = binarySearch(purchasePrice, purchasePrice.add(1000), target);
      result = Math.floor(sellPrice * 100) / 100;
      break;
    }
  }
  return result
}

// const type = 'US';
// const startDate = new Date('2024-03-01');
// const endDate = new Date('2024-4-01');
// const expectedYearRate = 0.1;
// const costPrice = 100;
// const quantity = 1;
// const platformFee = 10;

// const result = calculator({
//   type,
//   startDate,
//   endDate,
//   expectedYearRate,
//   costPrice,
//   quantity,
//   platformFee,
// })
// console.log('result: ', result);


export default calculator;