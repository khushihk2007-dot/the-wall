import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SensorDataProvider } from './context/SensorDataContext';
import { DataSourceFilterProvider } from './context/DataSourceFilterContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <SensorDataProvider>
        <DataSourceFilterProvider>
          <AppRoutes />
        </DataSourceFilterProvider>
      </SensorDataProvider>
    </BrowserRouter>
  );
}
