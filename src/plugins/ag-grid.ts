import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { RowGroupingModule, CellSelectionModule, TreeDataModule, RowNumbersModule  } from 'ag-grid-enterprise' // Enterprise-модули (будет работать в демо-режиме без ключа)
// Пример места для будущего ключа лицензии:
// import { LicenseManager } from 'ag-grid-enterprise'
// LicenseManager.setLicenseKey(import.meta.env.VITE_AGGRID_LICENSE_KEY)

ModuleRegistry.registerModules([ AllCommunityModule, RowGroupingModule, CellSelectionModule, TreeDataModule, RowNumbersModule  ]);