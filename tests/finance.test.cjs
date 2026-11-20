const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Permite probar funciones de dominio sin construir el frontend, con TypeScript local instalado.
require.extensions['.ts'] = (mod, filename) => {
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename,
  }).outputText;
  mod._compile(code, filename);
};
const { calculateFinancialSummary, filterMovementsByPeriod, getTodayISODate } = require('../src/utils/finance.utils.ts');
const { calculatePocketCurrentSaved, calculatePocketSummary } = require('../src/utils/pockets.utils.ts');
const { validateBackup } = require('../src/services/backup.service.ts');

test('presupuesto, gasto, ingreso y porcentajes coherentes', () => {
  const movements = [
    { type: 'expense', amountCOP: 1418500, dateISO: '2025-07-16' },
    { type: 'income', amountCOP: 50000, dateISO: '2025-07-17' },
  ];
  const x = calculateFinancialSummary(3500000, movements);
  assert.equal(x.additionalIncomeCOP, 50000);
  assert.equal(x.totalExpensesCOP, 1418500);
  assert.equal(x.availableBalanceCOP, 2131500);
  assert.equal(x.spentPercentageInt + x.availablePercentageInt, 100);
});
test('gasto superior al límite genera déficit y la gráfica se limita a 100%', () => {
  const x = calculateFinancialSummary(100000, [{type: 'expense', amountCOP: 150000}]);
  assert.equal(x.availableBalanceCOP, -50000);
  assert.equal(x.isDeficit, true);
  assert.equal(x.graphicalSpentPercentage, 100);
});
test('filtrado por mes no mezcla meses', () => {
  const data = [{dateISO:'2025-07-12',createdAt:2},{dateISO:'2025-08-03',createdAt:3},{dateISO:'2025-07-13',createdAt:4}];
  assert.deepEqual(filterMovementsByPeriod(data,'2025-07').map(x=>x.dateISO),['2025-07-13','2025-07-12']);
});
test('aporte y retiro no se contabilizan como gasto y transferencia conserva reserva total', () => {
  const movements = [
    {pocketId:'a',type:'deposit',amountCOP:100000},
    {pocketId:'a',type:'transfer_out',amountCOP:40000},
    {pocketId:'b',type:'transfer_in',amountCOP:40000},
    {pocketId:'b',type:'withdrawal',amountCOP:10000},
  ];
  assert.equal(calculatePocketCurrentSaved('a', movements),60000);
  assert.equal(calculatePocketCurrentSaved('b', movements),30000);
  assert.equal(calculatePocketCurrentSaved('a', movements)+calculatePocketCurrentSaved('b', movements),90000);
});
test('plan de ahorro real / esperado tiene diferencia correcta', () => {
  const p = {id:'vac',targetAmountCOP:1500000,startDateISO:'2025-01-01',targetDateISO:'2025-12-31',frequency:'monthly',plannedPeriodicAmountCOP:100000};
  const a = calculatePocketSummary(p,[{pocketId:'vac',type:'deposit',amountCOP:650000,dateISO:'2025-07-10'}]);
  assert.equal(a.currentSavedCOP,650000);
  assert.equal(a.remainingCOP,850000);
  assert.ok(a.progressPercentage > 40 && a.progressPercentage < 45);
});
test('validación de copia de seguridad previene fechas y cantidades inválidas', () => {
  const sample = { version: 1, exportedAt:'2026-11-20T00:00:00Z',finance:{movements:[{id:'e',type:'expense',amountCOP:1000,dateISO:'2026-11-20',description:'Almuerzo'}],budgets:{'2026-11':500000},activePeriod:{key:'2026-11',year:2026,month:11,label:'Noviembre 2026'}},savings:{pockets:[],movements:[]} };
  assert.equal(validateBackup(sample).version,1);
  assert.throws(()=>validateBackup({...sample,finance:{...sample.finance,movements:[{...sample.finance.movements[0],amountCOP:-1}]}}));
  assert.throws(()=>validateBackup({...sample,finance:{...sample.finance,movements:[{...sample.finance.movements[0],dateISO:'2026-02-30'}]}}));
});
test('fecha actual en zona Bogota en formato ISO', () => assert.match(getTodayISODate(), /^\d{4}-\d{2}-\d{2}$/));
