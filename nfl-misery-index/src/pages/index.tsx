import React, { useEffect } from 'react';
import Papa from 'papaparse';
import { Chart } from '../components/chart';

const Index: React.FC<{}> = () => {
  useEffect(() => {
    Papa.parse('https://nfl-index-data.s3.us-east-2.amazonaws.com/scores_with_index.csv', {
      download: true,
      worker: true,
      complete: results => {
        //debugger;
      },
    });
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Chart />
    </div>
  );
};

export default Index;
