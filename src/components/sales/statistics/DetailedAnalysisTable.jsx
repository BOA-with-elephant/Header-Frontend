import React from 'react';
import styles from '@/styles/admin/sales/SalesStatistics.module.css';

const DetailedAnalysisTable = ({ data, title }) => {
  const calcGrowthRate = (current, previous) => {
    const currNum = Number(current);
    const prevNum = Number(previous);
    if (isNaN(currNum) || isNaN(prevNum) || prevNum === 0) {
      return '-';
    }
    return (((currNum - prevNum) / prevNum) * 100).toFixed(2);
  };

  const formatPeriod = (label) => label || '-';

  const isLoading = data.loading || false;
  const hasData = Array.isArray(data.data) && data.data.length > 0;

  // 역순으로 정렬 (최신 월 위)
  const reversedData = hasData ? data.data.slice().reverse() : [];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.chartLoading}>로딩 중...</div>
        ) : hasData ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeaderCell}>월</th>
                <th className={styles.tableHeaderCell}>매출액</th>
                <th className={styles.tableHeaderCell}>전월 대비 상승률</th>
              </tr>
            </thead>
            <tbody>
              {reversedData.map((item, idx) => {
                const currAmount = Number(item.totalAmount);
                // 이전 월 데이터는 현재 인덱스 + 1 위치에 있음 (역순이니까)
                const prevAmount = idx + 1 < reversedData.length ? Number(reversedData[idx + 1].totalAmount) : null;
                const growthRate = prevAmount === null ? '-' : calcGrowthRate(currAmount, prevAmount);

                return (
                  <tr key={item.label} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellPrimary}`}>
                      {formatPeriod(item.label)}
                    </td>
                    <td className={styles.tableCell}>
                      {!isNaN(currAmount) ? currAmount.toLocaleString() + '원' : '0원'}
                    </td>
                    <td
                      className={styles.tableCell}
                      style={{ color: growthRate === '-' ? 'inherit' : growthRate >= 0 ? 'green' : 'red' }}
                    >
                      {growthRate === '-' ? '-' : growthRate + '%'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.noData}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default DetailedAnalysisTable;
