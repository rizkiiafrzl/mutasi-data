export const DEFAULT_RISK_LEVEL = "Rendah";

export const RISK_LEVEL_TARIFFS = {
  "Sangat Rendah": 0.0024,
  Rendah: 0.0054,
  Sedang: 0.0089,
  Tinggi: 0.0127,
  "Sangat Tinggi": 0.0174,
};

export const JKM_RATE = 0.003;
export const JHT_COMPANY_RATE = 0.037;
export const JHT_EMPLOYEE_RATE = 0.02;
export const JP_COMPANY_RATE = 0.02;
export const JP_EMPLOYEE_RATE = 0.01;
export const DEFAULT_JP_SALARY_CAP = 9_810_000;

function normalizeNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return 0;
  }
  return num;
}

function getJkkRate(riskLevel) {
  if (!riskLevel) return RISK_LEVEL_TARIFFS[DEFAULT_RISK_LEVEL];
  const formatted =
    typeof riskLevel === "string"
      ? riskLevel
          .trim()
          .replace(/\s+/g, " ")
          .replace(/(^\w)|(\s\w)/g, (match) => match.toUpperCase())
      : DEFAULT_RISK_LEVEL;
  return (
    RISK_LEVEL_TARIFFS[formatted] || RISK_LEVEL_TARIFFS[DEFAULT_RISK_LEVEL]
  );
}

export function calculateWorkerContribution({
  baseSalary,
  totalSalary,
  riskLevel,
  jpSalaryCap = DEFAULT_JP_SALARY_CAP,
} = {}) {
  const salaryBase = normalizeNumber(baseSalary ?? totalSalary);
  const salaryTotal = normalizeNumber(totalSalary ?? baseSalary);
  const jpBase = Math.min(salaryBase, normalizeNumber(jpSalaryCap));
  const appliedRiskLevel = riskLevel || DEFAULT_RISK_LEVEL;
  const jkkRate = getJkkRate(appliedRiskLevel);

  const companyJkk = salaryBase * jkkRate;
  const companyJkm = salaryBase * JKM_RATE;
  const companyJht = salaryBase * JHT_COMPANY_RATE;
  const companyJp = jpBase * JP_COMPANY_RATE;

  const employeeJht = salaryBase * JHT_EMPLOYEE_RATE;
  const employeeJp = jpBase * JP_EMPLOYEE_RATE;

  const companyTotal = companyJkk + companyJkm + companyJht + companyJp;
  const employeeTotal = employeeJht + employeeJp;
  const overallTotal = companyTotal + employeeTotal;

  return {
    riskLevel: appliedRiskLevel,
    salaryBase,
    salaryTotal,
    jpBase,
    rates: {
      jkk: jkkRate,
      jkm: JKM_RATE,
      jhtCompany: JHT_COMPANY_RATE,
      jhtEmployee: JHT_EMPLOYEE_RATE,
      jpCompany: JP_COMPANY_RATE,
      jpEmployee: JP_EMPLOYEE_RATE,
    },
    breakdown: {
      company: {
        jkk: companyJkk,
        jkm: companyJkm,
        jht: companyJht,
        jp: companyJp,
        total: companyTotal,
      },
      employee: {
        jht: employeeJht,
        jp: employeeJp,
        total: employeeTotal,
      },
    },
    totals: {
      overall: overallTotal,
      company: companyTotal,
      employee: employeeTotal,
    },
  };
}

export function calculateTotalContributions(workers = [], options = {}) {
  const {
    defaultRiskLevel = DEFAULT_RISK_LEVEL,
    jpSalaryCap = DEFAULT_JP_SALARY_CAP,
    salaryAccessor = (worker) => worker.upahPokok ?? worker.totalUpah ?? 0,
    totalSalaryAccessor = (worker) => worker.totalUpah ?? worker.upahPokok ?? 0,
    riskLevelAccessor = (worker) => worker.riskLevel || worker.riskCategory,
  } = options;

  return workers.reduce(
    (acc, worker) => {
      const contribution = calculateWorkerContribution({
        baseSalary: salaryAccessor(worker),
        totalSalary: totalSalaryAccessor(worker),
        riskLevel: riskLevelAccessor(worker) || defaultRiskLevel,
        jpSalaryCap,
      });

      acc.company.jkk += contribution.breakdown.company.jkk;
      acc.company.jkm += contribution.breakdown.company.jkm;
      acc.company.jht += contribution.breakdown.company.jht;
      acc.company.jp += contribution.breakdown.company.jp;
      acc.company.total += contribution.breakdown.company.total;

      acc.employee.jht += contribution.breakdown.employee.jht;
      acc.employee.jp += contribution.breakdown.employee.jp;
      acc.employee.total += contribution.breakdown.employee.total;

      acc.totals.overall += contribution.totals.overall;
      acc.totals.company += contribution.totals.company;
      acc.totals.employee += contribution.totals.employee;

      return acc;
    },
    {
      company: { jkk: 0, jkm: 0, jht: 0, jp: 0, total: 0 },
      employee: { jht: 0, jp: 0, total: 0 },
      totals: { overall: 0, company: 0, employee: 0 },
    }
  );
}



